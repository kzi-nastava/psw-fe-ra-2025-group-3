import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { ClubService } from '../../club.service';
import { ClubDto, ClubJoinRequestByTouristDto } from '../../model/club.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ClubFormDialogComponent } from '../club-form-dialog/club-form-dialog.component';
import { Person } from '../../../model/person.model';
import { StakeholderService } from '../../../stakeholder.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourExecutionService } from 'src/app/feature-modules/tour-execution/tour-execution.service';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { GroupTourSessionService } from 'src/app/feature-modules/tour-execution/group-tour-session.service';
import { GroupTourSessionDto } from 'src/app/feature-modules/tour-execution/model/group-tour-session.model';
import { GroupTourSessionParticipantDto } from 'src/app/feature-modules/tour-execution/model/group-tour-session.model';

interface MemberDetails {
  person: Person;
  tour: Tour;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: Date;
}

interface TourHighlight {
  id: number;
  tourName: string;
  date: Date;
  participantsCount: number;
  imageUrl: string;
  participants: Array<{ id: number; name: string; surname: string }>;
}

@Component({
  selector: 'xp-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit, OnDestroy {
  // Core data
  club: ClubDto | null = null;
  user: User | undefined;
  
  // Loading states
  isLoading = false;
  isGroupToursLoading = false;
  isPurchasedToursLoading = false;

  // Join requests
  requests: ClubJoinRequestByTouristDto[] = [];

  // Tourist invitation
  touristControl = new FormControl<string | Person>('');
  allTourists: Person[] = [];
  filteredTourists!: Observable<Person[]>;
  
  // Members
  memberDetailsMap = new Map<number, MemberDetails>();

  // UI state
  selectedTabIndex = 1;
  expandedHighlightIds = new Set<number>();

  // Group tours
  activeGroupSessions: GroupTourSessionDto[] = [];
  participantPersonCache = new Map<number, Person>();
  tourNameCache = new Map<number, string>();
  participantActiveTourNameCache = new Map<number, string>();
  
  // Purchased tours
  purchasedTours: Tour[] = [];
  selectedPurchasedTourId: number | null = null;

  // Mock data
  readonly mockAnnouncements: Announcement[] = [
    {
      id: 1,
      title: 'Welcome New Members!',
      content: 'We are excited to welcome our newest members to the club. Looking forward to many adventures together!',
      date: new Date('2025-01-15')
    },
    {
      id: 2,
      title: 'Upcoming Event: Annual Meetup',
      content: 'Save the date! Our annual club meetup will be held on February 20th. More details coming soon.',
      date: new Date('2025-01-10')
    }
  ];

  readonly mockHighlights: TourHighlight[] = [
    {
      id: 1,
      tourName: 'Alpine Lakes Trek',
      date: new Date('2024-12-15'),
      participantsCount: 8,
      imageUrl: 'https://placehold.co/600x400',
      participants: [{ id: 1, name: 'John', surname: 'Doe' }]
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private stakeholderService: StakeholderService,
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private groupTourSessionService: GroupTourSessionService
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Initialization =====
  private initializeSubscriptions(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (this.club) {
          this.loadActiveGroupSessions(this.club.id);
        }
      });
  }

  private loadInitialData(): void {
    const clubId = this.getClubIdFromRoute();
    if (clubId) {
      this.loadClub(clubId);
    }
    this.loadTourists();
    this.loadMyPurchasedTours();
  }

  private getClubIdFromRoute(): number | null {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return id || null;
  }

  // ===== Club Operations =====
  loadClub(id: number): void {
    this.isLoading = true;
    this.clubService.getClub(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (club) => {
          this.club = club;
          this.isLoading = false;
          this.loadMemberDetails();
          this.loadActiveGroupSessions(club.id);
          
          if (this.isOwner()) {
            this.getRequests(club.id);
          }
        },
        error: () => {
          this.isLoading = false;
          this.showError('Error loading club');
          this.router.navigate(['/clubs']);
        }
      });
  }

  toggleStatus(): void {
    if (!this.club) return;
    
    const newStatus = this.club.status === 'Active' ? 'Closed' : 'Active';
    this.clubService.changeStatus(this.club.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedClub) => {
          this.club = updatedClub;
          this.showSuccess(`Club status changed to ${newStatus}`);
        },
        error: () => this.showError('Error changing status')
      });
  }

  deleteClub(): void {
    if (!this.club || !this.confirmAction('Are you sure you want to delete this club?')) {
      return;
    }

    this.clubService.deleteClub(this.club.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Club deleted successfully');
          this.router.navigate(['/clubs']);
        },
        error: () => this.showError('Error deleting club')
      });
  }

  openEditDialog(): void {
    if (!this.club) return;
    
    const dialogRef = this.dialog.open(ClubFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { mode: 'edit', club: this.club }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && this.club) {
          this.loadClub(this.club.id);
        }
      });
  }

  // ===== Member Management =====
  loadMemberDetails(): void {
    if (!this.club?.memberIds?.length) return;

    this.club.memberIds.forEach(userId => {
      this.loadSingleMemberDetails(userId);
    });
  }

  private loadSingleMemberDetails(userId: number): void {
    this.stakeholderService.getPersonByUserId(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (person) => {
          this.tourExecutionService.getActiveTourByTouristId(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (tour) => this.memberDetailsMap.set(userId, { person, tour }),
              error: () => this.memberDetailsMap.set(userId, { person, tour: {} as Tour })
            });
        }
      });
  }

  inviteMember(): void {
    if (!this.club) return;

    const selectedTourist = this.touristControl.value;
    if (!this.isValidTouristSelection(selectedTourist)) {
      this.showError('Please select a tourist from the list');
      return;
    }

    const tourist = selectedTourist as Person;
    this.clubService.inviteMember(this.club.id, tourist.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedClub) => {
          this.club = updatedClub;
          this.touristControl.setValue('');
          this.memberDetailsMap.set(tourist.userId, { 
            person: tourist, 
            tour: {} as Tour 
          });
          this.showSuccess('Invitation sent successfully');
        },
        error: (err) => this.showError(err.error || 'Failed to invite member')
      });
  }

  kickMember(memberId: number): void {
    if (!this.club || !this.confirmAction('Remove this member from the club?')) {
      return;
    }

    this.clubService.kickMember(this.club.id, memberId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedClub) => {
          this.club = updatedClub;
          this.memberDetailsMap.delete(memberId);
          this.showSuccess('Member removed');
        },
        error: () => this.showError('Failed to remove member')
      });
  }

  getMemberName(userId: number): string {
    const member = this.memberDetailsMap.get(userId);
    return member 
      ? `${member.person.name} ${member.person.surname}` 
      : `User ID: ${userId}`;
  }

  getMemberActivity(userId: number | null | undefined): Tour | null {
    if (!userId && userId !== 0) return null;
    const member = this.memberDetailsMap.get(userId);
    return (member?.tour?.name) ? member.tour : null;
  }

  // ===== Join Requests =====
  getRequests(clubId: number): void {
    this.clubService.getClubJoinRequests(clubId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => this.requests = result,
        error: (err) => console.error('Failed to load requests', err)
      });
  }

  onRespond(requestId: number, accepted: boolean): void {
    this.clubService.respondToClubJoinRequest(requestId, accepted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess(accepted ? 'Request accepted' : 'Request rejected');
          if (this.club) {
            this.getRequests(this.club.id);
            if (accepted) {
              this.loadClub(this.club.id);
            }
          }
        },
        error: () => this.showError('Error responding to request')
      });
  }

  // ===== Tourist Management =====
  loadTourists(): void {
    this.stakeholderService.getAllTourists()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tourists) => {
          this.allTourists = tourists;
          this.setupAutocomplete();
        },
        error: () => this.showError('Failed to load tourists')
      });
  }

  private setupAutocomplete(): void {
    this.filteredTourists = this.touristControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTourists(value))
    );
  }

  private filterTourists(value: string | Person | null): Person[] {
    const searchTerm = typeof value === 'string' ? value : '';
    if (!searchTerm) return this.allTourists.slice();
    
    const filterValue = searchTerm.toLowerCase();
    return this.allTourists.filter(tourist =>
      tourist.name.toLowerCase().includes(filterValue) ||
      tourist.surname.toLowerCase().includes(filterValue)
    );
  }

  displayTourist(tourist: Person): string {
    return tourist ? `${tourist.name} ${tourist.surname}` : '';
  }

  private isValidTouristSelection(value: string | Person | null): value is Person {
    return !!value && typeof value !== 'string';
  }

  // ===== Group Tour Sessions =====
  hasActiveParticipants(session : GroupTourSessionDto) : boolean {
    const activeParticipants: GroupTourSessionParticipantDto[] =
      (session.participants ?? []).filter(p => !p.leftAt);

    return activeParticipants.length > 0;
  }

  getActiveParticipants(session: GroupTourSessionDto) : GroupTourSessionParticipantDto[] {
    return (session.participants ?? []).filter(p => !p.leftAt);
  }

  loadMyPurchasedTours(): void {
    this.isPurchasedToursLoading = true;
    this.tourService.getMyPurchasedTours().pipe(
      catchError(err => {
        console.error('Failed to load purchased tours', err);
        this.showError('Failed to load purchased tours');
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe(tours => {
      this.purchasedTours = tours ?? [];
      this.isPurchasedToursLoading = false;
    });
  }

  startGroupTourSession(): void {
    if (!this.club || !this.selectedPurchasedTourId) {
      this.showError('Please select a purchased tour');
      return;
    }

    this.groupTourSessionService
      .createSession({ 
        clubId: this.club.id, 
        tourId: this.selectedPurchasedTourId 
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Group tour session started');
          this.selectedPurchasedTourId = null;
          this.loadActiveGroupSessions(this.club!.id);
          this.loadMemberDetails();
        },
        error: (err) => {
          console.error(err);
          this.showError(err?.error ?? 'Failed to start group tour session');
        }
      });
  }

  loadActiveGroupSessions(clubId: number): void {
    this.isGroupToursLoading = true;
    this.groupTourSessionService.getActiveSessionsByClubId(clubId).pipe(
      catchError(err => {
        console.error('Failed to load active group sessions', err);
        this.showError('Failed to load active group tours');
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe(sessions => {
      this.activeGroupSessions = sessions ?? [];
      this.prefetchParticipantPeople(sessions);
      this.prefetchTourNames(sessions);
      this.prefetchParticipantActiveTours(sessions);
      this.isGroupToursLoading = false;
    });
  }

  private prefetchParticipantActiveTours(sessions: GroupTourSessionDto[]): void {
    const uniqueTouristIds = this.extractUniqueTouristIds(sessions);

    uniqueTouristIds.forEach(touristId => {
      if (this.participantActiveTourNameCache.has(touristId)) return;

      this.tourExecutionService.getActiveTourByTouristId(touristId).pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      ).subscribe(tour => {
        const name = tour?.name;
        if (name) this.participantActiveTourNameCache.set(touristId, name);
      });
    });
  }

  private prefetchParticipantPeople(sessions: GroupTourSessionDto[]): void {
    const uniqueTouristIds = this.extractUniqueTouristIds(sessions);
    
    uniqueTouristIds.forEach(touristId => {
      if (this.participantPersonCache.has(touristId) ) return;
      
      this.stakeholderService.getPersonByUserId(touristId).pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      ).subscribe(person => {
        if (person) {
          this.participantPersonCache.set(touristId, person);
        }
      });
    });
  }

  private prefetchTourNames(sessions: GroupTourSessionDto[]): void {
    const uniqueTourIds = this.extractUniqueTourIds(sessions);
    
    uniqueTourIds.forEach(tourId => {
      if (this.tourNameCache.has(tourId)) return;
      
      this.tourService.getTourById(tourId).pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      ).subscribe(tour => {
        if (tour) {
          this.tourNameCache.set(tourId, tour.name);
        }
      });
    });
  }

  private extractUniqueTouristIds(sessions: GroupTourSessionDto[]): Set<number> {
    const ids = new Set<number>();
    sessions.forEach(s => 
      (s.participants ?? []).forEach(p => ids.add(p.touristId))
    );
    return ids;
  }

  private extractUniqueTourIds(sessions: GroupTourSessionDto[]): Set<number> {
    return new Set(sessions.map(s => s.tourId));
  }

  sessionDisplayTourName(session: GroupTourSessionDto): string | null {
    const sessionTourName = this.tourNameCache.get(session.tourId);
    if (sessionTourName) return sessionTourName;

    const firstActiveParticipantId = this.getActiveParticipants(session)[0]?.touristId;
    if (firstActiveParticipantId === undefined) return null;

    return (
      this.participantActiveTourNameCache.get(firstActiveParticipantId) ??
      this.memberDetailsMap.get(firstActiveParticipantId)?.tour?.name ??
      null
    );
  }

  getTourName(tourId: number): string {
    return this.tourNameCache.get(tourId) ?? `Tour #${tourId}`;
  }

  participantDisplayProfilePicture(touristId: number): string | null {
    const person = this.participantPersonCache.get(touristId);
    return person ? (person.profilePictureUrl ?? null) : null;
  }

  participantDisplayName(touristId: number): string {
    const person = this.participantPersonCache.get(touristId);
    return person ? `${person.name} ${person.surname}` : `User ${touristId}`;
  }

  isJoined(session: GroupTourSessionDto): boolean {
    const currentTouristId = this.getCurrentTouristId();
    if (!currentTouristId) return false;
    
    return (session.participants ?? [])
      .some(p => p.touristId === currentTouristId && !p.leftAt);
  }

  onJoinSession(session: GroupTourSessionDto): void {
    const currentTouristId = this.getCurrentTouristId();
    if (!currentTouristId) {
      this.showError('You must be logged in to join.');
      return;
    }

    this.groupTourSessionService.join(session.id, currentTouristId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Joined group tour');
          if (this.club) {
            this.loadActiveGroupSessions(this.club.id);
            this.loadMemberDetails();
          }
        },
        error: (err) => {
          console.error(err);
          this.showError(err?.error ?? 'Failed to join group tour');
        }
      });
  }

  onLeaveSession(session: GroupTourSessionDto): void {
    const currentTouristId = this.getCurrentTouristId();
    if (!currentTouristId) {
      this.showError('You must be logged in to leave.');
      return;
    }

    this.groupTourSessionService.leave(session.id, currentTouristId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Left group tour');
          if (this.club) {
            this.loadActiveGroupSessions(this.club.id);
            this.loadMemberDetails();
          }
        },
        error: (err) => {
          console.error(err);
          this.showError(err?.error ?? 'Failed to leave group tour');
        }
      });
  }

  // ===== Highlights =====
  toggleHighlightParticipants(highlightId: number): void {
    if (this.expandedHighlightIds.has(highlightId)) {
      this.expandedHighlightIds.delete(highlightId);
    } else {
      this.expandedHighlightIds.add(highlightId);
    }
  }

  isHighlightExpanded(highlightId: number): boolean {
    return this.expandedHighlightIds.has(highlightId);
  }

  // ===== Getters =====
  get featuredImageUrl(): string | null {
    if (!this.club?.featuredImage) return null;
    return this.clubService.buildImageUrl(this.club.featuredImage.imageUrl);
  }

  get galleryUrls(): string[] {
    if (!this.club?.galleryImages) return [];
    return this.club.galleryImages.map(i => 
      this.clubService.buildImageUrl(i.imageUrl)
    );
  }

  isOwner(): boolean {
    return !!this.club && !!this.user && this.club.ownerId === this.user.id;
  }

  private getCurrentTouristId(): number | null {
    return this.user?.id ?? null;
  }

  // ===== Utility Methods =====
  private confirmAction(message: string): boolean {
    return confirm(message);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 3000, 
      panelClass: ['success-snackbar'] 
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 4000, 
      panelClass: ['error-snackbar'] 
    });
  }

  openManageMembersDialog(): void {
    this.showError('Manage Members dialog - Coming soon!');
  }
}