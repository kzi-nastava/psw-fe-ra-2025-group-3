export interface Facility {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: 'WC' | 'Restoran' | 'Parking' | 'Ostalo';
}
