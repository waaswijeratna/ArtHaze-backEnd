import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      delete ret._id;
    },
  },
})
export class Post extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  createdAt: string;

  @Prop({
    type: [{ userId: String, reactionName: String }],
    default: [],
  })
  reactions: { userId: string; reactionName: string }[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
