import { Component, Input, OnInit } from '@angular/core';
import { TourReviewService } from '../tour-review.service';
import { TourReview } from '../model/tour-review.model';

@Component({
  selector: 'xp-tour-reviews-list',
  templateUrl: './tour-reviews-list.component.html',
  styleUrls: ['./tour-reviews-list.component.css']
})
export class TourReviewsListComponent implements OnInit {
  @Input() tourId!: number;
  
  reviews: TourReview[] = [];
  isLoading = true;
  averageRating = 0;
  totalReviews = 0;

   Math = Math;

  constructor(private reviewService: TourReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.reviewService.getReviewsForTour(this.tourId).subscribe({
      next: (reviews) => {
        this.reviews = reviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.calculateAverageRating();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Reviews List] Error loading reviews:', err);
        this.isLoading = false;
      }
    });
  }

  private calculateAverageRating(): void {
    this.totalReviews = this.reviews.length;
    if (this.totalReviews === 0) {
      this.averageRating = 0;
      return;
    }
    
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.totalReviews;
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getFormattedDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}