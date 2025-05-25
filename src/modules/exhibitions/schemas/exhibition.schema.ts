import { Schema, Document, Types } from 'mongoose';

export const ExhibitionSchema = new Schema(
  {
    name: { type: String, required: true },
    gallery: { type: Types.ObjectId, ref: 'Gallery', required: true },
    artImages: { type: [String], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

export interface Exhibition extends Document {
  name: string;
  gallery: Types.ObjectId;
  artImages: string[];
  date: Date;
  time: string;
  userId: string;
}
