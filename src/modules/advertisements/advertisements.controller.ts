import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly adService: AdvertisementsService) {}

  @Post()
  create(@Body() createAdDto: CreateAdDto) {
    return this.adService.create(createAdDto);
  }

  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.adService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query() query: BaseQueryDto) {
    return this.adService.findByUser(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
    return this.adService.update(id, updateAdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adService.remove(id);
  }
}
