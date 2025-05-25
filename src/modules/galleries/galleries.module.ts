// src/galleries/galleries.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { Gallery, GallerySchema } from './schemas/gallery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gallery.name, schema: GallerySchema }]),
  ],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
