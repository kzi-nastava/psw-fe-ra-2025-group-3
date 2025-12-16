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
  isDraggingFeatured = false;
  isDraggingGallery = false;
  
  // Za UI preview zamene slika
  previewFeaturedUrl: string | null = null;
  originalFeaturedUrl: string | null = null;

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
        this.originalFeaturedUrl = data.club.featuredImage.imageUrl;
      }
    }
  }

  get name() { return this.form.get('name'); }
  get description() { return this.form.get('description'); }

  onFeaturedImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.handleFeaturedFile(file);
  }

  handleFeaturedFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image is too large. Maximum size is 5MB');
      return;
    }
    this.featuredImageFile = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.featuredImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.handleGalleryFiles(Array.from(input.files));
  }

  handleGalleryFiles(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      this.showError('Please select valid image files');
      return;
    }

    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      this.showError(`Some files are too large. Maximum size is 5MB`);
      return;
    }

    this.newGalleryFiles = imageFiles;
  }

  removeExistingGalleryImage(image: ClubImageDto): void {
    this.removedGalleryIds.push(image.id);
    this.existingGallery = this.existingGallery.filter(i => i.id !== image.id);
  }

  promoteToFeatured(image: ClubImageDto): void {
    // Sačuvaj ID slike koja se promovise (za backend)
    this.promoteGalleryImageId = image.id;
    
    // Sačuvaj originalnu featured sliku ako još nije sačuvana
    if (!this.originalFeaturedUrl && this.featuredImageUrl) {
      this.originalFeaturedUrl = this.featuredImageUrl;
    }
    
    // Samo vizuelna promena za UI preview
    this.previewFeaturedUrl = image.imageUrl;
    this.featuredImageFile = null; // Resetuj file jer koristimo postojeću sliku
  }
  
  // Helper metoda za prikaz featured slike
  getFeaturedDisplayUrl(): string | null {
    return this.previewFeaturedUrl || this.featuredImageUrl;
  }
  
  // Proveri da li je slika promovisan (za vizuelni efekat u galeriji)
  isImagePromoted(image: ClubImageDto): boolean {
    return this.promoteGalleryImageId === image.id;
  }

  // Drag and drop for featured image
  onDragOverFeatured(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFeatured = true;
  }

  onDragLeaveFeatured(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFeatured = false;
  }

  onDropFeatured(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFeatured = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFeaturedFile(files[0]);
    }
  }

  // Drag and drop for gallery images
  onDragOverGallery(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingGallery = true;
  }

  onDragLeaveGallery(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingGallery = false;
  }

  onDropGallery(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingGallery = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleGalleryFiles(Array.from(files));
    }
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
