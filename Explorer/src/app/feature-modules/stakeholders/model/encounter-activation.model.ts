export interface NearbyEncounterDto {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  xp: number;
  type: 'Social' | 'Location' | 'Misc';
  distanceInMeters: number;
  canActivate: boolean;
  isCompleted: boolean;
}

export interface EncounterActivationDto {
  id: number;
  encounterId: number;
  touristId: number;
  status: EncounterActivationStatus;
  activatedAt: string;
  completedAt: string | null;
}

export enum EncounterActivationStatus {
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed'
}

export interface PositionDto {
  latitude: number;
  longitude: number;
}
