export interface GroupTourSessionParticipantDto {
  sessionId: number;
  touristId: number;
  joinedAt: string;
  leftAt?: string | null;
  tourExecutionId: number;
  position?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface GroupTourSessionDto {
  id: number;
  tourId: number;
  tourName: number;
  clubId: number;
  status: number;
  startTime: string;
  starterId: number;
  isHighlighted: boolean;
  participants: GroupTourSessionParticipantDto[];
}

export interface HighlightedSessionParticipant {    
    touristId: number;
    name: string;
    surname: string;
    leftAt?: string | null;
}

export interface CreateGroupTourSessionDto {
  tourId: number;
  clubId: number;
  tourName: string;
}