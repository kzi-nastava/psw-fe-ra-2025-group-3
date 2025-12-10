import { KeyPoint } from '../../tour-authoring/key-points/model/key-point.model';
import { TourReview } from '../../tour-execution/model/tour-review.model';   

export interface TourDetails {
  id: number;
  name: string;
  description: string;
  length: number;             // ukupna dužina rute
  averageDuration: number;    // prosečno vreme prolaska
  startPoint: string;         // početna tačka kao naziv/string
  images: string[];           // URL-ovi slika
  reviews: TourReview[];      // lista recenzija
  
  keyPoints: KeyPoint[] | null;
}
