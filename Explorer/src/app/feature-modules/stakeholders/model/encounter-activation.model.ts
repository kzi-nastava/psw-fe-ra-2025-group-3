export interface NearbyEncounterDto {
  id: number;
  name: string;
  description: string;
  latitude: number;  // 0 for HiddenLocation (HIDDEN!)
  longitude: number; // 0 for HiddenLocation (HIDDEN!)
  xp: number;
  type: 'Misc' | 'Social' | 'HiddenLocation';
  distanceInMeters: number;
  canActivate: boolean;
  isCompleted: boolean;
  
  // For HiddenLocation
  imageUrl?: string;
  status?: string;  // For HiddenLocation: "TooFar", "Nearby", "Active", "Completed"
  
  // For Misc
  actionDescription?: string;
  
  // For Social
  requiredPeopleCount?: number;
  rangeInMeters?: number;  // Radius FROM ENCOUNTER COORDINATES
  currentPeopleNearby?: number;
}

export interface EncounterActivationDto {
  id: number;
  encounterId: number;
  touristId: number;
  status: EncounterActivationStatus;
  activatedAt: string;
  completedAt: string | null;
  
  // For HiddenLocation tracking
  lastLocationUpdateAt?: string;
  currentLatitude?: number;
  currentLongitude?: number;
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

export interface UpdateLocationRequest {
  encounterId: number;
  latitude: number;
  longitude: number;
}

export interface UpdateLocationResponse {
  isAtCorrectLocation: boolean;
  timeAtLocationSeconds: number;
  requiredSeconds: number;
  completed: boolean;
}
