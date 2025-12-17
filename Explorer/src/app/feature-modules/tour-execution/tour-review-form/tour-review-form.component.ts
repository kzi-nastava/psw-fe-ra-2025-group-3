import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TourReviewService } from '../tour-review.service';
import { TourReview, TourReviewEligibility, ReviewImage } from '../model/tour-review.model';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SelectedFile {
  file: File;
  preview: string;
}

@Component({
  selector: 'xp-tour-review-form',
  templateUrl: './tour-review-form.component.html',
  styleUrls: ['./tour-review-form.component.css']
})
export class TourReviewFormComponent implements OnInit {
  @Input() tourId!: number;
  @Input() existingReview?: TourReview;
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm!: FormGroup;
  eligibility?: TourReviewEligibility;
  isLoading = true;
  isSubmitting = false;
  hoveredStar = 0;

  selectedFiles: SelectedFile[] = [];
  existingImages: ReviewImage[] = [];
  isUploadingImages = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: TourReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEligibility();
    if (this.existingReview) {
      this.existingImages = this.existingReview.images || [];
    }
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [this.existingReview?.rating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [this.existingReview?.comment || '', [Validators.maxLength(1000)]]
    });

    if (this.existingReview) {
      this.reviewForm.disable();
    }
  }

  private checkEligibility(): void {
    this.isLoading = true;
    this.reviewService.checkEligibility(this.tourId).subscribe({
      next: (eligibility) => {
        this.eligibility = eligibility;
        this.isLoading = false;

        if (!eligibility.canReview) {
          this.reviewForm.disable();
        } else {
          this.reviewForm.enable();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error checking review eligibility', 'Close', { duration: 3000 });
      }
    });
  }

  setRating(rating: number): void {
    if (this.reviewForm.enabled) {
      this.reviewForm.patchValue({ rating });
    }
  }

  onStarHover(star: number): void {
    this.hoveredStar = star;
  }

  onStarLeave(): void {
    this.hoveredStar = 0;
  }

  getStarIcon(position: number): string {
    const currentRating = this.reviewForm.get('rating')?.value || 0;
    const displayRating = this.hoveredStar > 0 ? this.hoveredStar : currentRating;
    return position <= displayRating ? 'star' : 'star_border';
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - this.totalImagesCount;
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open(`Image "${file.name}" is too large. Max 5MB.`, 'Close', { duration: 3000 });
        continue;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open(`Image "${file.name}" has invalid format.`, 'Close', { duration: 3000 });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  deleteExistingImage(imageId: number): void {
    if (!confirm('Are you sure you want to delete this image?')) return;

    if (!this.existingReview) return;

    this.reviewService.deleteImageFromReview(this.existingReview.id, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(img => img.id !== imageId);
        this.snackBar.open('✅ Image deleted', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete image', 'Close', { duration: 3000 });
      }
    });
  }

  private async uploadImages(reviewId: number): Promise<void> {
    this.isUploadingImages = true;

    for (const selectedFile of this.selectedFiles) {
      try {
        const uploadResponse = await this.reviewService.uploadImage(selectedFile.file).toPromise();
        
        if (!uploadResponse) continue;

        await this.reviewService.addImageToReview(reviewId, uploadResponse.imageUrl).toPromise();
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    this.isUploadingImages = false;
  }

  async onSubmit(): Promise<void> {
    if (this.reviewForm.invalid || !this.eligibility?.canReview) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.reviewForm.value;

    if (this.existingReview) {
      const updateDto = {
        reviewId: this.existingReview.id,
        rating: formValue.rating,
        comment: formValue.comment || undefined
      };

      this.reviewService.updateReview(updateDto).subscribe({
        next: async (updatedReview) => {
          if (this.selectedFiles.length > 0) {
            await this.uploadImages(updatedReview.id);
          }

          this.snackBar.open('✅ Review updated successfully!', 'Close', { duration: 3000 });
          this.isSubmitting = false;
          this.selectedFiles = [];
          this.reviewSubmitted.emit();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to update review', 'Close', { duration: 4000 });
          this.isSubmitting = false;
        }
      });
    } else {
      const createDto = {
        tourId: this.tourId,
        rating: formValue.rating,
        comment: formValue.comment || undefined
      };

      this.reviewService.createReview(createDto).subscribe({
        next: async (newReview) => {
          if (this.selectedFiles.length > 0) {
            await this.uploadImages(newReview.id);
          }

          this.snackBar.open('✅ Review posted successfully!', 'Close', { duration: 3000 });
          this.isSubmitting = false;
          this.reviewForm.reset({ rating: 0, comment: '' });
          this.selectedFiles = [];
          this.reviewSubmitted.emit();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to post review', 'Close', { duration: 4000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.existingReview;
  }

  get canSubmit(): boolean {
    return this.reviewForm.valid && 
           this.eligibility?.canReview === true && 
           !this.isSubmitting &&
           !this.isUploadingImages;
  }

  get totalImagesCount(): number {
    return this.existingImages.length + this.selectedFiles.length;
  }

  get canAddMoreImages(): boolean {
    return this.totalImagesCount < 5;
  }

  getImageUrl(imageUrl: string): string {
    return this.reviewService.getImageUrl(imageUrl);
  }
  
}