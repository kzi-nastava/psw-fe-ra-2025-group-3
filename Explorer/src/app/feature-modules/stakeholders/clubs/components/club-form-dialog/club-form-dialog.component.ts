import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClubService } from '../../club.service';
import { ClubCreateDto, ClubDto, ClubUpdateDto, ClubImageDto } from '../../model/club.model';

export interface ClubFormDialogData {
  mode: 'create' | 'edit';
  club?: ClubDto;
}

@Component({
  selector: 'xp-club-form-dialog',
  templateUrl: './club-form-dialog.component.html',
  styleUrls: ['./club-form-dialog.component.css']
})
export class ClubFormDialogComponent {
  form: FormGroup;
  isEditMode: boolean;
  existingGallery: ClubImageDto[] = [];
  removedGalleryIds: number[] = [];
  newGalleryFiles: File[] = [];
  newGalleryUrls: string[] = [];
  featuredImageFile: File | null = null;
  featuredImageUrl: string | null = null; // relative URL from backend
  promoteGalleryImageId: number | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public clubService: ClubService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ClubFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClubFormDialogData
  ) {
    this.isEditMode = data.mode === 'edit';

    this.form = this.fb.group({
      name: [data.club?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [data.club?.description || '', [Validators.required, Validators.maxLength(2000)]],
    });

    if (this.isEditMode && data.club) {
      this.existingGallery = data.club.galleryImages || [];
      if (data.club.featuredImage) {
        this.featuredImageUrl = data.club.featuredImage.imageUrl;
      }
    }
  }

  get name() { return this.form.get('name'); }
  get description() { return this.form.get('description'); }

  onFeaturedImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.featuredImageFile = file;
  }

  onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.newGalleryFiles = Array.from(input.files);
  }

  removeExistingGalleryImage(image: ClubImageDto): void {
    this.removedGalleryIds.push(image.id);
    this.existingGallery = this.existingGallery.filter(i => i.id !== image.id);
  }

  promoteToFeatured(image: ClubImageDto): void {
    // Mark this gallery image to be promoted as featured on save
    this.promoteGalleryImageId = image.id;
    this.featuredImageUrl = image.imageUrl;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError('Please fill in all required fields');
      return;
    }

    if (!this.isEditMode && !this.featuredImageFile) {
      this.showError('Featured image is required');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.handleEdit();
    } else {
      this.handleCreate();
    }
  }

  private handleCreate(): void {
    // First upload featured image, then gallery, then create club.
    if (!this.featuredImageFile) {
      this.isSubmitting = false;
      return;
    }

    this.clubService.uploadFeaturedImage(this.featuredImageFile).subscribe({
      next: (featuredUrl) => {
        const uploadGallery$ = this.newGalleryFiles.length > 0
          ? this.clubService.uploadGalleryImages(this.newGalleryFiles)
          : null;

        if (uploadGallery$) {
          uploadGallery$.subscribe({
            next: (galleryUrls) => this.createClub(featuredUrl, galleryUrls),
            error: () => this.handleError('Error uploading gallery images')
          });
        } else {
          this.createClub(featuredUrl, []);
        }
      },
      error: () => this.handleError('Error uploading featured image')
    });
  }

  private createClub(featuredUrl: string, galleryUrls: string[]): void {
    const dto: ClubCreateDto = {
      name: this.name?.value,
      description: this.description?.value,
      featuredImageUrl: featuredUrl,
      galleryImageUrls: galleryUrls.length > 0 ? galleryUrls : undefined
    };

    this.clubService.createClub(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess('Club created successfully');
        this.dialogRef.close(true);
      },
      error: () => this.handleError('Error creating club')
    });
  }

  private handleEdit(): void {
    if (!this.data.club) {
      this.isSubmitting = false;
      return;
    }

    const id = this.data.club.id;

    const afterFeaturedUpload = (newFeaturedUrl: string | null) => {
      const afterGalleryUpload = (newGalleryUrls: string[] | null) => {
        const dto: ClubUpdateDto = {
          name: this.name?.value,
          description: this.description?.value,
          promoteGalleryImageId: this.promoteGalleryImageId || undefined,
          newFeaturedImageUrl: newFeaturedUrl || undefined,
          newGalleryImageUrls: newGalleryUrls || undefined,
          removedGalleryImageIds: this.removedGalleryIds.length > 0 ? this.removedGalleryIds : undefined
        };

        this.clubService.updateClub(id, dto).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.showSuccess('Club updated successfully');
            this.dialogRef.close(true);
          },
          error: () => this.handleError('Error updating club')
        });
      };

      if (this.newGalleryFiles.length > 0) {
        this.clubService.uploadGalleryImages(this.newGalleryFiles).subscribe({
          next: (urls) => afterGalleryUpload(urls),
          error: () => this.handleError('Error uploading gallery images')
        });
      } else {
        afterGalleryUpload(null);
      }
    };

    if (this.featuredImageFile) {
      this.clubService.uploadFeaturedImage(this.featuredImageFile).subscribe({
        next: (url) => afterFeaturedUpload(url),
        error: () => this.handleError('Error uploading featured image')
      });
    } else {
      afterFeaturedUpload(null);
    }
  }

  private handleError(message: string): void {
    this.isSubmitting = false;
    this.showError(message);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
  }
}
