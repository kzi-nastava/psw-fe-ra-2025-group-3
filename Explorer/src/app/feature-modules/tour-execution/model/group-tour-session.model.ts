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
  clubId: number;
  status: number;
  startTime: string;
  starterId: number;
  participants: GroupTourSessionParticipantDto[];
}

export interface CreateGroupTourSessionDto {
  tourId: number;
  clubId: number;
}