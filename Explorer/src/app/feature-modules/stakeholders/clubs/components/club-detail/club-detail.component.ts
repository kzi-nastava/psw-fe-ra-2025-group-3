import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubService } from '../../club.service';
import { ClubDto } from '../../model/club.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ClubFormDialogComponent } from '../club-form-dialog/club-form-dialog.component';

@Component({
  selector: 'xp-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit {
  club: ClubDto | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClub(id);
    }
  }

  loadClub(id: number): void {
    this.isLoading = true;
    this.clubService.getClub(id).subscribe({
      next: (club) => {
        this.club = club;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Error loading club');
        this.router.navigate(['/clubs']);
      }
    });
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
    const user = this.authService.user$.value;
    return !!this.club && !!user && this.club.ownerId === user.id;
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
  }
}
