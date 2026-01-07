import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubService } from '../../club.service';
import { ClubDto } from '../../model/club.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ClubFormDialogComponent } from '../club-form-dialog/club-form-dialog.component';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-my-clubs',
  templateUrl: './my-clubs.component.html',
  styleUrls: ['./my-clubs.component.css']
})
export class MyClubsComponent implements OnInit {
  clubs: ClubDto[] = [];
  page = 1;
  pageSize = 6;
  totalCount = 0;
  isLoading = false;

  constructor(
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.isLoading = true;
    this.clubService.getMyClubs(this.page, this.pageSize).subscribe({
      next: (result: PagedResults<ClubDto>) => {
        this.clubs = result.results;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Error loading my clubs');
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

  openEditDialog(club: ClubDto): void {
    const dialogRef = this.dialog.open(ClubFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { mode: 'edit', club }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClubs();
      }
    });
  }

  deleteClub(club: ClubDto): void {
    if (!confirm('Are you sure you want to delete this club?')) return;

    this.clubService.deleteClub(club.id).subscribe({
      next: () => {
        this.showSuccess('Club deleted successfully');
        this.loadClubs();
      },
      error: () => {
        this.showError('Error deleting club');
      }
    });
  }

  getClubImageUrl(club: ClubDto): string | null {
    if (!club.featuredImage || !club.featuredImage.imageUrl) return null;
    return this.clubService.buildImageUrl(club.featuredImage.imageUrl);
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
}
