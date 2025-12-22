export interface Encounter {
  id?: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  xp: number;
  status: EncounterStatus;
  type: EncounterType;
}

export enum EncounterStatus {
  Draft = 'Draft',
  Active = 'Active',
  Archived = 'Archived'
}

export enum EncounterType {
  Social = 'Social',
  Location = 'Location',
  Misc = 'Misc'
}
