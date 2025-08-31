import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
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
  async getExhibitions(@Query() query: BaseQueryDto): Promise<Exhibition[]> {
    return this.exhibitionsService.findAll(query);
  }

  @Get('cards')
  async getExhibitionsWithGallery(@Query() query: BaseQueryDto) {
    return this.exhibitionsService.getAllWithGalleryInfo(query);
  }

  @Get('details')
  async getExhibitionDetails(@Query('exhibitionId') exhibitionId: string) {
    return this.exhibitionsService.getDetailsById(exhibitionId);
  }

  // 🔹 Get exhibitions of a specific user
  @Get('user/:userId')
  async getUserExhibitions(
    @Param('userId') userId: string,
    @Query() query: BaseQueryDto,
  ): Promise<Exhibition[]> {
    return this.exhibitionsService.findByUserId(userId, query);
  }

  // 🔹 Update exhibition
  @Put(':id')
  async updateExhibition(
    @Param('id') id: string,
    @Body() updateExhibitionDto: UpdateExhibitionDto,
  ): Promise<Exhibition> {
    return this.exhibitionsService.updateExhibition(id, updateExhibitionDto);
  }

  // 🔹 Delete exhibition
  @Delete(':id')
  async deleteExhibition(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.exhibitionsService.deleteExhibition(id);
  }
}
