import { AuthorTourDto } from './author-tour.model';
export interface RecentTourReviewDto {
  reviewId: number;
  tourId: number;
  tourName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthorProfileStatsDto {
  authorId: number;
  totalTours: number;
  authorName: string;
  authorSurname: string;
  totalReviews: number;
  averageRating: number;
  totalPurchases: number;
  recentReviews: RecentTourReviewDto[];
  tours: AuthorTourDto[];
}
