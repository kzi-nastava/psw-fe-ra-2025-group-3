import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ClubService } from '../../club.service';
import { ClubDto, ClubJoinRequestByTouristDto } from '../../model/club.model'; 
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ClubFormDialogComponent } from '../club-form-dialog/club-form-dialog.component';
import { Person } from '../../../model/person.model';
import { StakeholderService } from '../../../stakeholder.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourExecutionService } from 'src/app/feature-modules/tour-execution/tour-execution.service';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';

@Component({
  selector: 'xp-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit {
  club: ClubDto | null = null;
  isLoading = false;
  user: User | undefined; 
  
  requests: ClubJoinRequestByTouristDto[] = []; 

  touristControl = new FormControl<string | Person>('');
  allTourists: Person[] = [];
  filteredTourists!: Observable<Person[]>;
  memberDetailsMap: Map<number, { person: Person, tour: Tour }> = new Map();

  // Tab selection
  selectedTabIndex = 1; // Default to Content tab (0=Group Tours, 1=Content, 2=Members)

  // Mock data for Group Tours
  mockGroupTours = [
    {
      id: 1,
      name: 'Weekend Mountain Hike',
      description: 'Join us for an exciting mountain adventure this weekend!',
      currentParticipants: 5,
      maxParticipants: 10,
      isJoined: false,
      participants: [
        { id: 1, name: 'John', surname: 'Doe' },
        { id: 2, name: 'Jane', surname: 'Smith' },
        { id: 3, name: 'Mike', surname: 'Johnson' },
        { id: 4, name: 'Sarah', surname: 'Williams' },
        { id: 5, name: 'Tom', surname: 'Brown' }
      ]
    },
    {
      id: 2,
      name: 'City Photography Walk',
      description: 'Explore the city and capture beautiful moments together.',
      currentParticipants: 8,
      maxParticipants: 12,
      isJoined: true,
      participants: [
        { id: 6, name: 'Emily', surname: 'Davis' },
        { id: 7, name: 'David', surname: 'Miller' },
        { id: 8, name: 'Lisa', surname: 'Wilson' },
        { id: 9, name: 'Chris', surname: 'Moore' },
        { id: 10, name: 'Anna', surname: 'Taylor' },
        { id: 11, name: 'James', surname: 'Anderson' },
        { id: 12, name: 'Sophia', surname: 'Thomas' },
        { id: 13, name: 'Daniel', surname: 'Jackson' }
      ]
    },
    {
      id: 3,
      name: 'Beach Cleanup & Picnic',
      description: 'Help clean the beach and enjoy a picnic afterwards.',
      currentParticipants: 3,
      maxParticipants: 15,
      isJoined: false,
      participants: [
        { id: 14, name: 'Robert', surname: 'White' },
        { id: 15, name: 'Maria', surname: 'Harris' },
        { id: 16, name: 'William', surname: 'Martin' }
      ]
    }
  ];

  // Mock data for Announcements
  mockAnnouncements = [
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

  // Mock data for Tour Highlights
  mockHighlights = [
    {
      id: 1,
      tourName: 'Alpine Lakes Trek',
      date: new Date('2024-12-15'),
      participantsCount: 8,
      imageUrl: 'https://placehold.co/600x400',
      participants: [
        { id: 1, name: 'John', surname: 'Doe' },
        { id: 2, name: 'Jane', surname: 'Smith' },
        { id: 3, name: 'Mike', surname: 'Johnson' },
        { id: 4, name: 'Sarah', surname: 'Williams' },
        { id: 5, name: 'Tom', surname: 'Brown' },
        { id: 6, name: 'Emily', surname: 'Davis' },
        { id: 7, name: 'David', surname: 'Miller' },
        { id: 8, name: 'Lisa', surname: 'Wilson' }
      ]
    },
    {
      id: 2,
      tourName: 'Coastal Road Trip',
      date: new Date('2024-11-20'),
      participantsCount: 6,
      imageUrl: 'https://placehold.co/600x400',
      participants: [
        { id: 9, name: 'Chris', surname: 'Moore' },
        { id: 10, name: 'Anna', surname: 'Taylor' },
        { id: 11, name: 'James', surname: 'Anderson' },
        { id: 12, name: 'Sophia', surname: 'Thomas' },
        { id: 13, name: 'Daniel', surname: 'Jackson' },
        { id: 14, name: 'Robert', surname: 'White' }
      ]
    },
    {
      id: 3,
      tourName: 'Historic City Tour',
      date: new Date('2024-10-10'),
      participantsCount: 12,
      imageUrl: 'https://placehold.co/600x400',
      participants: [
        { id: 15, name: 'Maria', surname: 'Harris' },
        { id: 16, name: 'William', surname: 'Martin' },
        { id: 17, name: 'Olivia', surname: 'Garcia' },
        { id: 18, name: 'Benjamin', surname: 'Martinez' },
        { id: 19, name: 'Ava', surname: 'Rodriguez' },
        { id: 20, name: 'Lucas', surname: 'Lee' },
        { id: 21, name: 'Mia', surname: 'Walker' },
        { id: 22, name: 'Henry', surname: 'Hall' },
        { id: 23, name: 'Charlotte', surname: 'Allen' },
        { id: 24, name: 'Alexander', surname: 'Young' },
        { id: 25, name: 'Amelia', surname: 'King' },
        { id: 26, name: 'Sebastian', surname: 'Wright' }
      ]
    }
  ];

  // Track expanded highlights
  expandedHighlightIds: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private stakeholderService: StakeholderService,
    private tourExecutionService: TourExecutionService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClub(id);
    }
    this.loadTourists();
  }

  loadTourists(): void {
    this.stakeholderService.getAllTourists().subscribe({
      next: (tourists) => {
        this.allTourists = tourists;
        this.setupAutocomplete();
      },
      error: () => {
        this.showError('Failed to load tourists');
      }
    });
  }

  setupAutocomplete(): void {
    this.filteredTourists = this.touristControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchTerm = typeof value === 'string' ? value : '';
        return searchTerm ? this._filterTourists(searchTerm) : this.allTourists.slice();
      })
    );
  }

  private _filterTourists(value: string): Person[] {
    const filterValue = value.toLowerCase();
    return this.allTourists.filter(tourist => 
      tourist.name.toLowerCase().includes(filterValue) ||
      tourist.surname.toLowerCase().includes(filterValue)
    );
  }

  displayTourist(tourist: Person): string {
    return tourist ? `${tourist.name} ${tourist.surname}` : '';
  }

  loadClub(id: number): void {
    this.isLoading = true;
    this.clubService.getClub(id).subscribe({
      next: (club) => {
        this.club = club;
        this.isLoading = false;
        this.loadMemberDetails();

        if (this.user && this.club.ownerId === this.user.id) {
            this.getRequests(this.club.id);
        }
      },
      error: () => {
        this.isLoading = false;
        this.showError('Error loading club');
        this.router.navigate(['/clubs']);
      }
    });
  }

  getRequests(clubId: number): void {
    this.clubService.getClubJoinRequests(clubId).subscribe({
        next: (result) => { 
            this.requests = result; 
        },
        error: (err) => console.error('Failed to load requests', err)
    });
  }

  onRespond(requestId: number, accepted: boolean): void {
    this.clubService.respondToClubJoinRequest(requestId, accepted).subscribe({
        next: () => {
            this.showSuccess(accepted ? 'Request accepted' : 'Request rejected');
            if(this.club) {
                this.getRequests(this.club.id);
                if(accepted) {
                    this.loadClub(this.club.id);
                }
            }
        },
        error: (err) => this.showError('Error responding to request')
    });
  }

  loadMemberDetails(): void {
    if (!this.club || !this.club.memberIds || this.club.memberIds.length === 0) {
      return;
    }

    this.club.memberIds.forEach(userId => {
      this.stakeholderService.getPersonByUserId(userId).subscribe({
        next: (person) => {
          this.tourExecutionService.getActiveTourByTouristId(userId).subscribe({
            next: (tour) => {
              this.memberDetailsMap.set(userId, { person, tour });
            },
            error: () => {
              this.memberDetailsMap.set(userId, { person, tour: {} as Tour });
            }
          });
        },
        error: () => {
          console.warn(`Failed to load details for user ${userId}`);
        }
      });
    });
  }

  getMemberName(userId: number): string {
    const member = this.memberDetailsMap.get(userId);
    if (member) {
      return `${member.person.name} ${member.person.surname}`;
    }
    return `User ID: ${userId}`;
  }

  getMemberActivity(userId: number) : string {
    const member = this.memberDetailsMap.get(userId);
    if (member) {
        return `${member.tour.name}`;
    }
    return `No tour`;
  }

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

  get featuredImageUrl(): string | null {
    if (!this.club || !this.club.featuredImage) return null;
    return this.clubService.buildImageUrl(this.club.featuredImage.imageUrl);
  }

  get galleryUrls(): string[] {
    if (!this.club || !this.club.galleryImages) return [];
    return this.club.galleryImages.map(i => this.clubService.buildImageUrl(i.imageUrl));
  }

  isOwner(): boolean {
    return !!this.club && !!this.user && this.club.ownerId === this.user.id;
  }

  toggleStatus(): void {
    if (!this.club) return;
    const newStatus = this.club.status === 'Active' ? 'Closed' : 'Active';
    
    this.clubService.changeStatus(this.club.id, newStatus).subscribe({
      next: (updatedClub) => {
        this.club = updatedClub;
        this.showSuccess(`Club status changed to ${newStatus}`);
      },
      error: (err) => this.showError('Error changing status')
    });
  }

  inviteMember(): void {
    if (!this.club) return;
    
    const selectedTourist = this.touristControl.value;
    if (!selectedTourist || typeof selectedTourist === 'string') {
      this.showError('Please select a tourist from the list');
      return;
    }
    
    this.clubService.inviteMember(this.club.id, selectedTourist.userId).subscribe({
      next: (updatedClub) => {
        this.club = updatedClub;
        this.touristControl.setValue('');
        this.memberDetailsMap.set(selectedTourist.userId, { person: selectedTourist, tour: {} as Tour });
        this.showSuccess('Invitation sent successfully');
      },
      error: (err) => this.showError(err.error || 'Failed to invite member')
    });
  }

  kickMember(memberId: number): void {
    if (!this.club) return;
    if (!confirm('Remove this member from the club?')) return;

    this.clubService.kickMember(this.club.id, memberId).subscribe({
      next: (updatedClub) => {
        this.club = updatedClub;
        this.memberDetailsMap.delete(memberId);
        this.showSuccess('Member removed');
      },
      error: (err) => this.showError('Failed to remove member')
    });
  }

  openEditDialog(): void {
    if (!this.club) return;
    const dialogRef = this.dialog.open(ClubFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { mode: 'edit', club: this.club }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.club) {
        this.loadClub(this.club.id);
      }
    });
  }

  openManageMembersDialog(): void {
    // TODO: Implementirati dialog za upravljanje članovima
    // Slično kao openEditDialog(), ali sa novim dialogom
    this.showError('Manage Members dialog - Coming soon!');
    
    /* Primer implementacije kada kreirate dialog komponentu:
    
    const dialogRef = this.dialog.open(ManageMembersDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { 
        club: this.club,
        members: this.memberDetailsMap,
        allTourists: this.allTourists
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.club) {
        this.loadClub(this.club.id);
      }
    });
    */
  }

  deleteClub(): void {
    if (!this.club) return;
    if (!confirm('Are you sure you want to delete this club?')) return;

    this.clubService.deleteClub(this.club.id).subscribe({
      next: () => {
        this.showSuccess('Club deleted successfully');
        this.router.navigate(['/clubs']);
      },
      error: () => {
        this.showError('Error deleting club');
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
  }
}