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
  images: ReviewImage[]; 
}

export interface ReviewImage {
  id: number;
  tourReviewId: number;
  imageUrl: string;
  uploadedAt: Date;
}
export interface ImageUploadResponse {
  imageUrl: string;
  fileName: string;
}

export interface AddImageRequest {
  imageUrl: string;
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