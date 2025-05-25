// src/exhibitions/exhibitions.controller.ts
import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { ExhibitionsService } from './exhibitions.service';
import { Exhibition } from './schemas/exhibition.schema';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Post()
  async createExhibition(
    @Body() createExhibitionDto: CreateExhibitionDto,
  ): Promise<Exhibition> {
    return this.exhibitionsService.createExhibition(createExhibitionDto);
  }

  @Get()
  async getExhibitions(): Promise<Exhibition[]> {
    return this.exhibitionsService.findAll();
  }

  @Get('cards')
  async getExhibitionsWithGallery() {
    return this.exhibitionsService.getAllWithGalleryInfo();
  }

  @Get('details')
  async getExhibitionDetails(@Query('exhibitionId') exhibitionId: string) {
    return this.exhibitionsService.getDetailsById(exhibitionId);
  }
}
