import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BundleService } from '../bundle.service';
import { Bundle, BundleStatus } from '../model/bundle.model';
import { BundleFormComponent } from '../bundle-form/bundle-form.component';

@Component({
  selector: 'app-bundle-list',
  templateUrl: './bundle-list.component.html',
  styleUrls: ['./bundle-list.component.css']
})
export class BundleListComponent implements OnInit {
  bundles: Bundle[] = [];
  displayedBundles: Bundle[] = [];
  bundlesPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor(
    private bundleService: BundleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBundles();
  }

  loadBundles(): void {
    this.isLoading = true;
    this.bundleService.getMyBundles().subscribe({
      next: (result) => {
        this.bundles = result || [];
        this.updateDisplayedBundles();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bundles:', error);
        this.showError('Error loading bundles');
        this.bundles = [];
        this.displayedBundles = [];
        this.isLoading = false;
      }
    });
  }

  updateDisplayedBundles(): void {
    if (!this.bundles || this.bundles.length === 0) {
      this.displayedBundles = [];
      return;
    }
    const endIndex = this.currentPage * this.bundlesPerPage;
    this.displayedBundles = this.bundles.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayedBundles();
  }

  hasMoreBundles(): boolean {
    return this.bundles && this.displayedBundles && 
           this.displayedBundles.length < this.bundles.length;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BundleFormComponent, {
      width: '800px',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBundles();
      }
    });
  }

  openEditDialog(bundle: Bundle): void {
    if (bundle.status === BundleStatus.Archived) {
      this.showError('Cannot edit an archived bundle');
      return;
    }

    const dialogRef = this.dialog.open(BundleFormComponent, {
      width: '800px',
      data: { mode: 'edit', bundle: bundle },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBundles();
      }
    });
  }

  deleteBundle(bundle: Bundle): void {
    if (bundle.status !== BundleStatus.Draft) {
      this.showError('You can only delete bundles in Draft status');
      return;
    }

    if (confirm('Are you sure you want to delete this bundle?')) {
      this.bundleService.deleteBundle(bundle.id!).subscribe({
        next: () => {
          this.showSuccess('Bundle successfully deleted');
          this.loadBundles();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showError('Error deleting bundle');
        }
      });
    }
  }

  publishBundle(bundle: Bundle): void {
    if (bundle.status !== BundleStatus.Draft) {
      this.showError('You can only publish bundles in Draft status');
      return;
    }

    this.bundleService.publishBundle(bundle.id!).subscribe({
      next: () => {
        this.showSuccess('Bundle successfully published');
        this.loadBundles();
      },
      error: (error) => {
        console.error('Publish error:', error);
        const errorMsg = error.error || 'Bundle must contain at least 2 published tours';
        this.showError(errorMsg);
      }
    });
  }

  archiveBundle(bundle: Bundle): void {
    if (confirm('Are you sure you want to archive this bundle?')) {
      this.bundleService.archiveBundle(bundle.id!).subscribe({
        next: () => {
          this.showSuccess('Bundle archived successfully');
          this.loadBundles();
        },
        error: (error) => {
          console.error('Archive error:', error);
          this.showError(error.error || 'Error archiving bundle');
        }
      });
    }
  }

  getStatusLabel(status: BundleStatus): string {
    const labels = {
      [BundleStatus.Draft]: 'Draft',
      [BundleStatus.Published]: 'Published',
      [BundleStatus.Archived]: 'Archived'
    };
    return labels[status] || 'Unknown';
  }

  getStatusClass(status: BundleStatus): string {
    const classes = {
      [BundleStatus.Draft]: 'status-draft',
      [BundleStatus.Published]: 'status-published',
      [BundleStatus.Archived]: 'status-archived'
    };
    return classes[status] || '';
  }

  canDelete(bundle: Bundle): boolean {
    return bundle?.status === BundleStatus.Draft;
  }

  canPublish(bundle: Bundle): boolean {
    return bundle?.status === BundleStatus.Draft;
  }

  canArchive(bundle: Bundle): boolean {
    return bundle?.status === BundleStatus.Published;
  }

  canEdit(bundle: Bundle): boolean {
    return bundle?.status !== BundleStatus.Archived;
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
}