import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { FundraisingService } from './fundraising.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto'; // ✅ import filters

@Controller('campaigns')
export class FundraisingController {
  constructor(private readonly campaignService: FundraisingService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.campaignService.delete(id);
  }

  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.campaignService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query() query: BaseQueryDto) {
    return this.campaignService.findByUser(userId, query);
  }
}
