// tour-reviews-list.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { TourReviewService } from '../tour-review.service';
import { TourReview } from '../model/tour-review.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StakeholderService } from '../../stakeholders/stakeholder.service';
import { TouristStats, RANK_CONFIGS } from '../../stakeholders/model/tourist-stats.model';

@Component({
  selector: 'xp-tour-reviews-list',
  templateUrl: './tour-reviews-list.component.html',
  styleUrls: ['./tour-reviews-list.component.css']
})
export class TourReviewsListComponent implements OnInit {
  @Input() tourId!: number;
  @Input() currentUserId?: number;
  @Input() showOnlyMyReviews = false;
  
  reviews: TourReview[] = [];
  isLoading = true;
  averageRating = 0;
  totalReviews = 0;
  Math = Math;

  isLightboxOpen = false;
  currentImageIndex = 0;
  lightboxImages: string[] = [];

  // ✅ Cache - promenjen tip
  private nameCache: Map<number, string> = new Map();
  private statsCache: Map<number, TouristStats> = new Map();

  constructor(
    private reviewService: TourReviewService,
    private stakeholderService: StakeholderService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;

    const reviewsObservable = this.showOnlyMyReviews
      ? this.reviewService.getMyAllReviews()
      : this.reviewService.getReviewsForTour(this.tourId);

    reviewsObservable.subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.calculateAverageRating();
        this.loadTouristData();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoading = false;
      }
    });
  }

  // Učitaj imena i statistike
  private loadTouristData(): void {
    if (this.reviews.length === 0) {
      this.isLoading = false;
      return;
    }

    const uniqueTouristIds = [...new Set(this.reviews.map(r => r.touristId))];
    
    const nameRequests = uniqueTouristIds.map(touristId => 
      this.reviewService.getTouristName(touristId).pipe(
        catchError(() => of('Anonymous'))
      )
    );

    const statsRequests = uniqueTouristIds.map(touristId =>
      this.stakeholderService.getTouristStatsByUserId(touristId).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin([forkJoin(nameRequests), forkJoin(statsRequests)]).subscribe({
      next: ([names, stats]) => {
        uniqueTouristIds.forEach((touristId, index) => {
          this.nameCache.set(touristId, names[index]);
          const statData = stats[index];
          if (statData && statData !== null) {
            this.statsCache.set(touristId, statData as TouristStats);
          }
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Getter
  getTouristName(touristId: number): string {
    return this.nameCache.get(touristId) || 'Anonymous';
  }

  // Novi getter za rank badge
  getTouristRankIcon(touristId: number): string {
    const stats = this.statsCache.get(touristId);
    if (!stats) return '';

    const rankConfig = RANK_CONFIGS.find(
      config => stats.level >= config.minLevel && stats.level <= config.maxLevel
    );

    // Prikaži samo za Gold (🥇) i Vista (👑)
    if (rankConfig?.name === 'Gold' || rankConfig?.name === 'Vista') {
      return rankConfig.icon;
    }

    return '';
  }

  // Novi getter za rank name
  getTouristRank(touristId: number): string {
    const stats = this.statsCache.get(touristId);
    if (!stats) return '';

    const rankConfig = RANK_CONFIGS.find(
      config => stats.level >= config.minLevel && stats.level <= config.maxLevel
    );

    return rankConfig?.name || '';
  }

  // Da li je Featured Tourist (Platinum+)
  isFeaturedTourist(touristId: number): boolean {
    const stats = this.statsCache.get(touristId);
    if (!stats) return false;
    return stats.level >= 15; // Platinum and above
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

  getImageUrl(imageUrl: string): string {
    return this.reviewService.getImageUrl(imageUrl);
  }

  openImageModal(image: any): void {
    window.open(this.getImageUrl(image.imageUrl), '_blank');
  }

  openLightbox(imageUrls: string[], startIndex: number = 0): void {
    this.lightboxImages = imageUrls;
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

  openReviewImageLightbox(review: TourReview, startIndex: number): void {
    if (review.images) {
      const imageUrls = review.images.map(img => this.getImageUrl(img.imageUrl));
      this.openLightbox(imageUrls, startIndex);
    }
  }
}