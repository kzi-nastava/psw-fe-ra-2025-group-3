export interface Person {
    id:number,
    userId: number;
    name: string;
    surname: string;
    email: string;
    profilePictureUrl?: string;
    biography?: string;
    quote?: string;
    isActive?: boolean;
}