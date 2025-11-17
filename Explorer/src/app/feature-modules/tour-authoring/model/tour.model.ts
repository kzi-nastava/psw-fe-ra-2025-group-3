export interface Tour {
  id: number;
  name: string;
  description: string;
  difficulty: TourDifficulty;
  status: TourStatus;
  price: number;
  tags: string[];
  authorId: number;
  createdAt: Date;
  updatedAt?: Date;
}

export enum TourDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export enum TourStatus {
  Draft = 0,
  Published = 1,
}

export interface TourCreateDto {
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
}

export interface TourUpdateDto {
  id?: number;
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
  price?: number;
}