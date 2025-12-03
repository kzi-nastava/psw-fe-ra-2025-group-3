export interface TourReview {
  id: number;
  tourId: number;
  touristId: number;
  touristName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt?: Date;
  progressPercentage: number;
  isEdited: boolean;
}

export interface TourReviewCreateDto {
  tourId: number;
  rating: number;
  comment?: string;
}

export interface TourReviewUpdateDto {
  reviewId: number;
  rating: number;
  comment?: string;
}

export interface TourReviewEligibility {
  canReview: boolean;
  reasonIfNot?: string;
  currentProgress: number;
  daysSinceLastActivity: number;
}