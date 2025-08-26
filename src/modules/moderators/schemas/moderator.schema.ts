import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Moderator extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age: number;

  @Prop({ required: true })
  password: string;

  @Prop()
  pfpUrl: string;

  @Prop({ required: true, enum: ['super', 'normal'], default: 'normal' })
  role: string;
}

export const ModeratorSchema = SchemaFactory.createForClass(Moderator);
