export interface TourProblem {
  id: number;
  tourId: number;
  touristId: number;
  authorId: number;
  category: ProblemCategory;
  priority: ProblemPriority;
  description: string;
  time: string;
  status: ProblemStatus;
  resolvedByTouristComment?: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
  tourName?: string;        // For admin view - tour name
  touristName?: string;     // For admin view - tourist name
  isOverdue?: boolean;      // For admin view - problem older than 5 days
  daysOpen?: number;        // For admin view - number of days problem is open
}

export interface Message {
  id: number;
  authorId: number;
  content: string;
  timestamp: string;
  authorType: AuthorType;
}

export enum ProblemCategory {
  Transportation = 0,  // Prevoz
  Accommodation = 1,   // Smestaj
  Location = 2,        // Lokacija
  Food = 3,            // Hrana
  Other = 4            // Ostalo
}

export enum ProblemPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum ProblemStatus {
  Open = 0,
  Resolved = 1,
  Unresolved = 2
}

export enum AuthorType {
  Tourist = 0,
  Author = 1,
  Admin = 2
}

export interface TourProblemCreateDto {
  tourId: number;
  category: ProblemCategory;
  priority: ProblemPriority;
  description: string;
  time: string;
}

export interface TourProblemUpdateDto {
  category: ProblemCategory;
  priority: ProblemPriority;
  description: string;
  time: string;
}

export interface AddMessageDto {
  content: string;
}

export interface MarkProblemResolvedDto {
  touristComment: string;
}