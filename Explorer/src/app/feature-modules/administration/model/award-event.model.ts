export enum AwardEventStatus {
    Draft = 'Draft',
    VotingOpen = 'VotingOpen',
    VotingClosed = 'VotingClosed',
    Archived = 'Archived'
}

export interface AwardEvent {
    id?: number; 
    name: string;
    description: string;
    year: number;
    status: AwardEventStatus; 
    votingStartDate: Date;
    votingEndDate: Date;
}