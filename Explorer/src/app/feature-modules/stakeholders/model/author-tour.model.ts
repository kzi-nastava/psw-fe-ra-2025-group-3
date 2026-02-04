export interface AuthorTourDto {
  tourId: number;
  name: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  difficulty?: string;
  status?: string;
  createdAt?: string;
}
