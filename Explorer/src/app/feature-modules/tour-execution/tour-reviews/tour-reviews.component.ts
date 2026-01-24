import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TourReviewService } from '../tour-review.service';
import { TourReview, TourReviewEligibility } from '../model/tour-review.model';
import { TourReviewsListComponent } from '../tour-reviews-list/tour-reviews-list.component';

@Component({
  selector: 'xp-tour-reviews',
  templateUrl: './tour-reviews.component.html',
  styleUrls: ['./tour-reviews.component.css']
})
export class TourReviewsComponent implements OnInit {
  @Input() tourId!: number;
  @Input() currentUserId?: number; // Za turistu koji je ulogovan
  @ViewChild(TourReviewsListComponent) reviewsList?: TourReviewsListComponent;

  myReview?: TourReview;
  showForm = false;
  isLoadingMyReview = true;
  eligibility?: TourReviewEligibility;

  constructor(private reviewService: TourReviewService) {}

  ngOnInit(): void {
    if (this.currentUserId) {
      this.loadMyReview();
      this.checkEligibility();
    } else {
      this.isLoadingMyReview = false;
    }
  }

  checkEligibility(): void {
    this.reviewService.checkEligibility(this.tourId).subscribe({
      next: (eligibility) => {
        this.eligibility = eligibility;
      },
      error: (err) => {
        // Ako dođe do greške, ne prikazuj dugme
        this.eligibility = { canReview: false, reasonIfNot: '', currentProgress: 0, daysSinceLastActivity: 0 };
      }
    });
  }

  loadMyReview(): void {
    this.isLoadingMyReview = true;
    this.reviewService.getMyReview(this.tourId).subscribe({
      next: (review) => {
        this.myReview = review || undefined;
        this.isLoadingMyReview = false;
      },
      error: (err) => {
        // 404 znači da nema recenzije, to je OK
        if (err.status === 404) {
          this.myReview = undefined;
        }
        this.isLoadingMyReview = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onReviewSubmitted(): void {
    this.showForm = false;
    this.loadMyReview();
    // Refresh-uj listu svih recenzija
    if (this.reviewsList) {
      this.reviewsList.loadReviews();
    }
  }

  get hasMyReview(): boolean {
    return !!this.myReview;
  }

  get canShowLeaveReviewButton(): boolean {
    return !this.hasMyReview && !this.showForm && !!this.eligibility?.canReview;
  }
}