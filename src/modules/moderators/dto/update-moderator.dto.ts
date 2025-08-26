export class UpdateModeratorDto {
  name?: string;
  email?: string;
  age?: number;
  pfpUrl?: string;
  role?: 'super' | 'normal';
}
