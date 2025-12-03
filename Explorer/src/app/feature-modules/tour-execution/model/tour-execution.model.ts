export interface TourExecution {
  id: number;
  touristId: number;
  tourId: number;
  startTime: Date;
  status: TourExecutionStatus;
  startLatitude: number;
  startLongitude: number;
  completionTime?: Date;
  abandonTime?: Date;
  lastActivity: Date;
  progressPercentage: number;
}

export enum TourExecutionStatus {
  Active = 0,
  Completed = 1,
  Abandoned = 2
}

export interface TourExecutionCreateDto {
  tourId: number;
  startLatitude: number;
  startLongitude: number;
}