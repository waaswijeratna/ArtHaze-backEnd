import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Campaign extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  reason: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  stripeAccountId: string;

  @Prop({ default: 0 })
  fundedAmount: number;

  @Prop({ required: true })
  userId: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
