import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // adds createdAt, updatedAt automatically
export class Notice extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 'active' }) // default status
  status: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
