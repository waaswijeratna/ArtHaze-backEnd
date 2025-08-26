export class CreateModeratorDto {
  name: string;
  email: string;
  age: number;
  password: string;
  pfpUrl: string;
  role?: 'super' | 'normal' = 'normal';
}
