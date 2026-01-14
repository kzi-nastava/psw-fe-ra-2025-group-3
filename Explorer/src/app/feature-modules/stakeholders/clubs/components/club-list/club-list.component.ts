import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubService } from '../../club.service';
import { ClubDto } from '../../model/club.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ClubFormDialogComponent } from '../club-form-dialog/club-form-dialog.component';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-club-list',
  templateUrl: './club-list.component.html',
  styleUrls: ['./club-list.component.css']
})
export class ClubListComponent implements OnInit {
  clubs: ClubDto[] = [];
  page = 1;
  pageSize = 6;
  totalCount = 0;
  isLoading = false;
  user: User | undefined;

  constructor(
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.user = user;
      } else {
        this.user = undefined;
      }
    });
    this.loadClubs();
  }

  loadClubs(): void {
    this.isLoading = true;
    this.clubService.getClubs(this.page, this.pageSize).subscribe({
      next: (result: PagedResults<ClubDto>) => {
        this.clubs = result.results;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Error loading clubs');
      }
    });
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadClubs();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ClubFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClubs();
      }
    });
  }

  getClubImageUrl(club: ClubDto): string | null {
    if (!club.featuredImage || !club.featuredImage.imageUrl) return null;
    return this.clubService.buildImageUrl(club.featuredImage.imageUrl);
  }

  isMember(club: ClubDto): boolean {
    if (!this.user) return false;
    return club.memberIds && club.memberIds.includes(this.user.id);
  }

  isOwner(club: ClubDto): boolean {
    if (!this.user) return false;
    return club.ownerId == this.user.id;
  }

  onJoinClub(clubId: number): void {
    this.clubService.sendClubJoinRequest(clubId).subscribe({
      next: () => {
        this.snackBar.open('Request sent successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.showError(err.error?.detail || 'Failed to send request. You might have already requested to join.');
      }
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
  }
}