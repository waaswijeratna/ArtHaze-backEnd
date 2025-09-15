import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
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

  @Prop()
  stripeAccountId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
