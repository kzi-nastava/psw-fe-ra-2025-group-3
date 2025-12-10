import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TourReviewService } from '../tour-review.service';
import { TourReview, TourReviewEligibility } from '../model/tour-review.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
    private fb: FormBuilder,
    private reviewService: TourReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEligibility();
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [this.existingReview?.rating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [this.existingReview?.comment || '', [Validators.maxLength(1000)]]
    });

    if (this.existingReview) {
      // Ako je edit mode, odmah proveri eligibility
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
        console.error('[Review Form] Error checking eligibility:', err);
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

  onSubmit(): void {
    if (this.reviewForm.invalid || !this.eligibility?.canReview) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.reviewForm.value;

    if (this.existingReview) {
      // Update existing review
      const updateDto = {
        reviewId: this.existingReview.id,
        rating: formValue.rating,
        comment: formValue.comment || undefined
      };

      this.reviewService.updateReview(updateDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Review updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSubmitting = false;
          this.reviewSubmitted.emit();
        },
        error: (err) => {
          console.error('[Review Form] Error updating review:', err);
          this.snackBar.open(err.error?.message || 'Failed to update review', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new review
      const createDto = {
        tourId: this.tourId,
        rating: formValue.rating,
        comment: formValue.comment || undefined
      };

      this.reviewService.createReview(createDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Review posted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isSubmitting = false;
          this.reviewForm.reset({ rating: 0, comment: '' });
          this.reviewSubmitted.emit();
        },
        error: (err) => {
          console.error('[Review Form] Error creating review:', err);
          this.snackBar.open(err.error?.message || 'Failed to post review', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
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
           !this.isSubmitting;
  }
}