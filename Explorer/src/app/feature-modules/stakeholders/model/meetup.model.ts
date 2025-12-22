export interface Meetup {
  id: number;
  title: string;
  description: string;
  dateTime: Date;
  latitude: number;
  longitude: number;
  creatorId: number;
  tourId?: number;
}

export interface MeetupCreateDto {
  title: string;
  description: string;
  dateTime: Date;
  latitude: number;
  longitude: number;
  tourId?: number;
}

export interface MeetupUpdateDto {
  title: string;
  description: string;
  dateTime: Date;
  latitude: number;
  longitude: number;
  tourId?: number;
}
