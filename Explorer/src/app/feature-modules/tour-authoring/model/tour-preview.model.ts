import { TourStatus } from './tour.model';
import { TourReview } from '../../tour-execution/model/tour-review.model';

export interface TourPreview {
  id: number;
  name: string;
  description: string;
  price: number;
  tags: string[];
  difficulty: string;
  averageRating: number;
  status: TourStatus; // <--- OVO SMO DODALI
  firstKeyPoint: KeyPointPreview | null;
  reviews: TourReview[];
}

export interface KeyPointPreview {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}