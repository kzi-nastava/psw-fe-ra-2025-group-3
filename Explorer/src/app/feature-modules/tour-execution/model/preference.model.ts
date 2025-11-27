export interface Preference {
  id: number;
  touristId: number;
  difficulty: TourDifficulty;
  walkingRating: number;
  bicycleRating: number;
  carRating: number;
  boatRating: number;
  tags: string[];
}

export interface PreferenceCreateDto {
  difficulty: TourDifficulty;
  walkingRating: number;
  bicycleRating: number;
  carRating: number;
  boatRating: number;
  tags: string[];
}

export interface PreferenceUpdateDto {
  id: number;
  difficulty: TourDifficulty;
  walkingRating: number;
  bicycleRating: number;
  carRating: number;
  boatRating: number;
  tags: string[];
}

export enum TourDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2
}


export const AVAILABLE_TAGS = [
  'Nature',
  'Culture',
  'Adventure',
  'History',
  'Relaxation',
  'Beach',
  'Mountain',
  'Hiking',
  'Sport',
  'City',
  'Food',
  'Architecture'
];