import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourService } from '../tour.service';
import { Tour, TourStatus, TourDifficulty } from '../model/tour.model';
import { TourFormComponent } from '../tour-form/tour-form.component';
import { TourWizardComponent } from '../tour-wizard/tour-wizard.component';
import { TourProblemsDialogComponent } from '../tour-problems-dialog/tour-problems-dialog.component';

@Component({
  selector: 'app-tour-list',
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.css']
})
export class TourListComponent implements OnInit {
  tours: Tour[] = [];
  displayedTours: Tour[] = [];
  toursPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;
  expandedTourId: number | null = null;

  constructor(
    private tourService: TourService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getMyTours().subscribe({
      next: (result) => {
        console.log('API Response:', result);
        this.tours = result || [];
        this.updateDisplayedTours();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.showError('Error loading tours');
        this.tours = [];
        this.displayedTours = [];
        this.isLoading = false;
      }
    });
  }

  updateDisplayedTours(): void {
    if (!this.tours || this.tours.length === 0) {
      this.displayedTours = [];
      return;
    }
    const endIndex = this.currentPage * this.toursPerPage;
    this.displayedTours = this.tours.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayedTours();
  }

  hasMoreTours(): boolean {
    return this.tours && this.displayedTours && this.displayedTours.length < this.tours.length;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TourWizardComponent, {
      width: '90vw',
      maxWidth: '90vw',
      height: '85vh',
      maxHeight: '85vh',
      data: { mode: 'create' },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTours();
      }
    });
  }

  openEditDialog(tour: Tour): void {
    if (tour.status === TourStatus.Archived) {
        this.showError('Cannot edit an archived tour. Reactivate it first.');
        return;
    }

    const dialogRef = this.dialog.open(TourWizardComponent, {
      width: '90vw',
      maxWidth: '90vw',
      height: '85vh',
      maxHeight: '85vh',
      data: { mode: 'edit', tour: tour },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTours();
      }
    });
  }

  deleteTour(tour: Tour): void {
    if (tour.status !== TourStatus.Draft) {
      this.showError('You can only delete tours in Draft status');
      return;
    }

    if (confirm('Are you sure you want to delete this tour?')) {
      this.tourService.deleteTour(tour.id!).subscribe({
        next: () => {
          this.showSuccess('Tour successfully deleted');
          this.loadTours();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showError('Error deleting tour');
        }
      });
    }
  }

  publishTour(tour: Tour): void {
    if (tour.status !== TourStatus.Draft) {
      this.showError('You can only publish tours in Draft status');
      return;
    }

    this.tourService.publishTour(tour.id!).subscribe({
      next: () => {
        this.showSuccess('Tour successfully published');
        this.loadTours();
      },
      error: (error) => {
        console.error('Publish error:', error);
        const errorMsg = error.error || 'Error publishing tour. Check if you have Key Points and Duration set.';
        this.showError(errorMsg);
      }
    });
  }

  archiveTour(tour: Tour): void {
    if (confirm('Are you sure you want to archive this tour?')) {
        this.tourService.archiveTour(tour.id!).subscribe({
            next: () => {
                this.showSuccess('Tour archived successfully');
                this.loadTours();
            },
            error: (error) => {
                console.error('Archive error:', error);
                this.showError(error.error || 'Error archiving tour');
            }
        });
    }
  }

  reactivateTour(tour: Tour): void {
    if (confirm('Are you sure you want to reactivate this tour?')) {
        this.tourService.reactivateTour(tour.id!).subscribe({
            next: () => {
                this.showSuccess('Tour reactivated successfully');
                this.loadTours();
            },
            error: (error) => {
                console.error('Reactivation error:', error);
                this.showError(error.error || 'Error reactivating tour');
            }
        });
    }
  }

  getDifficultyLabel(difficulty: TourDifficulty): string {
    const labels = {
      [TourDifficulty.Easy]: 'Easy',
      [TourDifficulty.Medium]: 'Medium',
      [TourDifficulty.Hard]: 'Hard'
    };
    return labels[difficulty] || 'Unknown';
  }

  // === POPRAVLJENO: Dodat 'Archived' status ===
  getStatusLabel(status: TourStatus): string {
    const labels = {
      [TourStatus.Draft]: 'Draft',
      [TourStatus.Published]: 'Published',
      [TourStatus.Archived]: 'Archived' 
    };
    return labels[status] || 'Unknown';
  }

  getStatusClass(status: TourStatus): string {
    const classes = {
      [TourStatus.Draft]: 'status-draft',
      [TourStatus.Published]: 'status-published',
      [TourStatus.Archived]: 'status-archived'
    };
    return classes[status] || '';
  }

  canDelete(tour: Tour): boolean {
    return tour?.status === TourStatus.Draft;
  }

  canPublish(tour: Tour): boolean {
    return tour?.status === TourStatus.Draft;
  }

  canArchive(tour: Tour): boolean {
    return tour?.status === TourStatus.Published;
  }

  canReactivate(tour: Tour): boolean {
    return tour?.status === TourStatus.Archived;
  }

  canEdit(tour: Tour): boolean {   
      return tour?.status !== TourStatus.Archived;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  expandReviews(tour: Tour): void {
    if (this.expandedTourId === tour.id) {
      this.expandedTourId = null;  // Collapse
    } else {
      this.expandedTourId = tour.id;  // Expand
    }
  }

  openProblemsDialog(tour: Tour): void {
    const dialogRef = this.dialog.open(TourProblemsDialogComponent, {
      width: '90vw',
      maxWidth: '90vw',
      height: '85vh',
      maxHeight: '85vh',
      data: { tourId: tour.id, tourName: tour.name },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Nema potrebe da reloadujem jer samo gledam probleme
    });
  }
}