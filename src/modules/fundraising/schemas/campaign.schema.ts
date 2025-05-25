// src/campaign/schemas/campaign.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  stripeAccountId: string;

  @Prop({ required: true, default: 0 })
  fundedAmount: number;

  @Prop({ required: true })
  requiredAmount: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
