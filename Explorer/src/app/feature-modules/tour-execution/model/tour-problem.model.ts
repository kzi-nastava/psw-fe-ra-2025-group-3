export interface TourProblem {
  id: number;
  tourId: number;
  touristId: number;
  category: ProblemCategory;
  priority: ProblemPriority;
  description: string;
  time: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export enum ProblemCategory {
  Transportation = 0,
  Accommodation = 1,
  Guide = 2,
  Location = 3,
  Food = 4,
  Other = 5
}

export enum ProblemPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}