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
}


export interface Equipment {
  id: number;
  name: string;
  description: string;
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
}

export interface TourUpdateDto {
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
  price?: number;
}