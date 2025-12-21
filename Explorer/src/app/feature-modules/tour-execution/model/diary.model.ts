export interface Diary {
  id: number;
  title: string;
  country: string;
  city?: string;
  createdAt: string;
  status: number; // 0 = Draft, 1 = Archived
}
