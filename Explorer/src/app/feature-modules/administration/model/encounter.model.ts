export interface Encounter {
  id?: number;
  name: string;
  description: string;
  latitude: number;  // GPS coordinates of encounter
  longitude: number;
  xp: number;
  status: EncounterStatus;
  type: EncounterType;
  
  // For Misc encounter
  actionDescription?: string;  // Action description (e.g., "Do 20 push-ups")
  
  // For Social encounter
  requiredPeopleCount?: number;  // How many people must be nearby
  rangeInMeters?: number;        // Radius FROM ENCOUNTER COORDINATES
  
  // For HiddenLocation encounter
  imageUrl?: string;  // Image URL as hint for finding the location
  // NOTE: latitude/longitude above are the REAL coordinates for HiddenLocation
  // Backend sends 0,0 to tourists to hide the location!
}

export enum EncounterStatus {
  Draft = 'Draft',
  Active = 'Active',
  Archived = 'Archived',
  PendingApproval = 'PendingApproval',
  Rejected = 'Rejected'
}

export enum EncounterType {
  Misc = 'Misc',
  Social = 'Social',
  HiddenLocation = 'HiddenLocation'
}
