export interface CompletedTour {
  executionId: number;
  tourId: number;
  tourName: string;
  completedAt: string;
  location: string;
  distanceInKm: number;
  durationInMinutes: number;
  tourImageUrl?: string;
  firstKeyPoint?: {
    imageUrl?: string;
  };
}

export interface TourStatistics {
  totalCompletedTours: number;
  totalDistanceTraveled: number;
  totalTimeSpent: number;
}

export interface TourComparison {
  yourCompletedTours: number;
  averageCompletedTours: number;
  toursPercentageDifference: number;
  yourTotalDistance: number;
  averageTotalDistance: number;
  distancePercentageDifference: number;
}

export interface TourHistoryResponse {
  completedTours: CompletedTour[];
  statistics: TourStatistics;
  comparison: TourComparison;
}
