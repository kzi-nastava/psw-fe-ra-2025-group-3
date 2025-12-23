export interface Meetup {
  id: number;
  title: string;
  description: string;
  dateTime: Date;
  address: string;
  latitude: number;
  longitude: number;
  creatorId: number;
}

export interface MeetupCreateDto {
  title: string;
  description: string;
  dateTime: Date;
  address: string;
  latitude: number;
  longitude: number;
}

export interface MeetupUpdateDto {
  title: string;
  description: string;
  dateTime: Date;
  address: string;
  latitude: number;
  longitude: number;
}
