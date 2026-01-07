// src/app/feature-modules/tour-execution/my-reviews/my-reviews.component.ts

import { Component, OnInit } from '@angular/core';
import { TourReviewService } from '../tour-review.service';
import { TourReview } from '../model/tour-review.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-my-reviews',
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit {
  myReviews: TourReview[] = [];
  isLoading = true;
  editingReviewId: number | null = null;

  isLightboxOpen = false;
  currentImageIndex = 0;
  lightboxImages: string[] = [];

  constructor(
    private reviewService: TourReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyReviews();
  }

  loadMyReviews(): void {
    this.isLoading = true;
    
    // Pozovi backend da vrati sve recenzije trenutnog korisnika
    this.reviewService.getMyAllReviews().subscribe({
      next: (reviews) => {
        this.myReviews = reviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading my reviews:', err);
        this.snackBar.open('Failed to load reviews', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleEdit(reviewId: number): void {
    this.editingReviewId = this.editingReviewId === reviewId ? null : reviewId;
  }

  cancelEdit(): void {
    this.editingReviewId = null;
  }

  onReviewUpdated(): void {
    this.editingReviewId = null;
    this.loadMyReviews();
    this.snackBar.open('✅ Review updated!', 'Close', { duration: 3000 });
  }


getStarsArray(rating: number): number[] {
  return Array(Math.round(rating)).fill(0); 
}
  getFormattedDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getImageUrl(imageUrl: string): string {
    return this.reviewService.getImageUrl(imageUrl);
  }

  openLightbox(images: string[], startIndex: number = 0): void {
    this.lightboxImages = images;
    this.currentImageIndex = startIndex;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.lightboxImages.length - 1) {
      this.currentImageIndex++;
    }
  }

  openImageLightbox(review: TourReview, startIndex: number): void {
    if (review.images) {
      const imageUrls = review.images.map(img => this.getImageUrl(img.imageUrl));
      this.openLightbox(imageUrls, startIndex);
    }
  }
}