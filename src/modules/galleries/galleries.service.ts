// src/galleries/galleries.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery, GalleryDocument } from './schemas/gallery.schema';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectModel(Gallery.name) private galleryModel: Model<GalleryDocument>,
  ) {}

  async findAll(): Promise<Gallery[]> {
    return this.galleryModel.find().exec();
  }
}
