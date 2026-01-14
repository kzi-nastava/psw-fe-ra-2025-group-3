import { TourDifficulty } from './tour.model';

export interface HighlightedTour {
  id: number;
  name: string;
  description: string;
  difficulty: TourDifficulty;
  price: number;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  length: number; // in km
  averageDuration: number; // in minutes
  startPoint: string; // name of the first KeyPoint (from backend)
  firstKeyPoint?: FirstKeyPoint; // first KeyPoint object with image
  reviews?: TourReview[];
  // Sale properties
  onSale?: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
}

export interface FirstKeyPoint {
  id: number;
  name: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

export interface TourReview {
  id: number;
  rating: number;
  comment: string;
  touristName: string;
  createdAt: Date;
}
