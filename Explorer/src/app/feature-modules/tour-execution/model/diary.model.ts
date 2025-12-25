export interface Diary {
  id: number;
  title: string;
  createdAt: string;
  status: number;
  country: string;
  city?: string | null;
  touristId: number;
}
