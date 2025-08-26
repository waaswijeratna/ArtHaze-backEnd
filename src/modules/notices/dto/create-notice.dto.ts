export class CreateNoticeDto {
  title: string;
  description: string;
  imageUrl: string;
  userId: string; // Reference to User or Moderator
  status: string; // e.g. "active", "inactive", "pending"
}
