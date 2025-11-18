export interface Monument {
  id: number;
  name: string;
  description: string;
  year: number;
  status: string;      // "Active" | "Inactive"
  latitude: number;
  longitude: number;
}
