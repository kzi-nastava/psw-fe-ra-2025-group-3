export interface Monument {
  id?: number;
  name: string;
  description: string;
  year: number;
  status: MonumentStatus;      // "Active" | "Inactive"
  latitude: number;
  longitude: number;
}

export enum MonumentStatus {
  Active = 1,  
  Inactive = 0 
}
