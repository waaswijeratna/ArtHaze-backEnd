// import { Schema, Document, Types } from 'mongoose';

// export const ExhibitionSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     gallery: { type: Types.ObjectId, ref: 'Gallery', required: true },
//     artImages: { type: [String], required: true },
//     date: { type: Date, required: true },
//     time: { type: String, required: true },
//     userId: { type: String, required: true },
//   },
//   { timestamps: true },
// );

// export interface Exhibition extends Document {
//   name: string;
//   gallery: Types.ObjectId;
//   artImages: string[];
//   date: Date;
//   time: string;
//   userId: string;
// }

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      return ret;
    },
  },
})
export class Exhibition extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Gallery', required: true })
  gallery: Types.ObjectId;

  @Prop({ type: [String], required: true })
  artImages: string[];

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const ExhibitionSchema = SchemaFactory.createForClass(Exhibition);
