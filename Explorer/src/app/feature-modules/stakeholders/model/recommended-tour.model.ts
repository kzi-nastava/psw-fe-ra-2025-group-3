// src/app/feature-modules/stakeholders/model/recommended-tour.model.ts
export interface RecommendedTour {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  price: number;
  distanceInKm: number;
  tags: string[];
  matchScore: number;
}