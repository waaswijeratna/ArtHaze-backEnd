import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryDocument = Gallery & Document;

@Schema()
export class Gallery {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  modelUrl: string;

  @Prop({ required: true })
  maxArts: number;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
