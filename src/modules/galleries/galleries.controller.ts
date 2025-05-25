// src/galleries/galleries.controller.ts

import { Controller, Get } from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { Gallery } from './schemas/gallery.schema';

@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get()
  async getAll(): Promise<Gallery[]> {
    return this.galleriesService.findAll();
  }
}
