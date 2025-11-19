export interface AppRatingResponse {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AppRatingRequest {
  rating: number;
  comment?: string | null;
}
