// src/campaign/dto/create-campaign.dto.ts
import { IsString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
  userId: string;

  @IsString()
  reason: string;

  @IsString()
  imageUrl: string;

  @IsString()
  stripeAccountId: string;

  requiredAmount: number;

  fundedAmount: number;
}
