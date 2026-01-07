export interface Tour {
  id: number;
  name: string;
  description: string;
  difficulty: TourDifficulty;
  status: TourStatus;
  price: number;
  tags: string[];
  equipment: Equipment[];
  authorId: number;
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  tourDurations: TourDuration[];
  
  averageRating?: number;
  firstKeyPoint?: KeyPoint;
  reviews?: TourReview[];
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
}

export enum TransportType {
  Walking = 0,
  Bicycle = 1,
  Car = 2
}

export interface TourDuration {
  timeInMinutes: number;
  transportType: TransportType;
}

export enum TourDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export enum TourStatus {
  Draft = 0,
  Published = 1,
  Archived = 2
}

export interface TourCreateDto {
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
  tourDurations: TourDuration[];
}

export interface TourUpdateDto {
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
  price?: number;
  tourDurations: TourDuration[];
}

export interface KeyPoint {
  id: number;
  name: string;
  description: string;
  imageUrl: string; 
  latitude: number;
  longitude: number;
}

export interface TourReview {
  id: number;
  rating: number;
  comment: string;
  touristId: number;
  touristName?: string;
  createdAt?: Date;
}

export interface TourSearchParams {
  name?: string;
  tags?: string[];
  difficulties?: TourDifficulty[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}