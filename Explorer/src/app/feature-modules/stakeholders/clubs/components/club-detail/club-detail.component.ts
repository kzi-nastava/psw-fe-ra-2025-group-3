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
import { TouristStats, RANK_CONFIGS } from '../../../model/tourist-stats.model';

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
  memberDetailsMap: Map<number, Person> = new Map();
  memberStatsMap: Map<number, TouristStats> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private stakeholderService: StakeholderService
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
                    // Notifikuj da se stats promenio - korisnik je ušao u klub
                    this.stakeholderService.notifyTouristStatsUpdated();
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
          this.memberDetailsMap.set(userId, person);
        },
        error: () => {
          console.warn(`Failed to load details for user ${userId}`);
        }
      });

      // Učitaj i tourist stats
      this.stakeholderService.getTouristStatsByUserId(userId).subscribe({
        next: (stats) => {
          this.memberStatsMap.set(userId, stats);
        },
        error: () => {
          // User nije turist ili nema stats - to je ok
        }
      });
    });
  }

  getMemberName(userId: number): string {
    const member = this.memberDetailsMap.get(userId);
    if (member) {
      return `${member.name} ${member.surname}`;
    }
    return `User ID: ${userId}`;
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
        this.memberDetailsMap.set(selectedTourist.userId, selectedTourist);
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

  // Novi getter za rank badge
  getMemberRankIcon(userId: number): string {
    const stats = this.memberStatsMap.get(userId);
    if (!stats) return '';

    const rankConfig = RANK_CONFIGS.find(
      config => stats.level >= config.minLevel && stats.level <= config.maxLevel
    );

    // Prikaži samo za Gold (🥇) i Vista (👑)
    if (rankConfig?.name === 'Gold' || rankConfig?.name === 'Vista') {
      return rankConfig.icon;
    }

    return '';
  }

  // Novi getter za rank name
  getMemberRank(userId: number): string {
    const stats = this.memberStatsMap.get(userId);
    if (!stats) return '';

    const rankConfig = RANK_CONFIGS.find(
      config => stats.level >= config.minLevel && stats.level <= config.maxLevel
    );

    return rankConfig?.name || '';
  }

  // Da li je Featured Tourist (Platinum+)
  isFeaturedTourist(userId: number): boolean {
    const stats = this.memberStatsMap.get(userId);
    if (!stats) return false;
    return stats.level >= 15; // Platinum and above
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
  }
}