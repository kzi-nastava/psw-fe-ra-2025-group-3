export interface AccountRegistrationDto {
  username: string;
  password: string;
  role: string;

  name: string;
  surname: string;
  email: string;

  phoneNumber?: string;
  biography?: string;
  quote?: string;
}
