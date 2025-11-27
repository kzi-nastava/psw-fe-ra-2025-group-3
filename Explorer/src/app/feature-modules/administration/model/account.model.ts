export enum AccountRole {
  Admin = 'Admin',
  Author = 'Author',
  Tourist = 'Tourist'
}

export enum AccountStatus {
  Active = 'Active',
  Blocked = 'Blocked'
}

export interface Account {
  id: number;
  username: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
}

export interface AccountCreateDto {
  username: string;
  password: string;
  email: string;
  role: AccountRole;
}

export interface AccountDto {
  id: number;
  username: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
}