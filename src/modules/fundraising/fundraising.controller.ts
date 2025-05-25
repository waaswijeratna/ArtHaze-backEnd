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

@Controller('campaigns')
export class FundraisingController {
  constructor(private readonly campaignService: FundraisingService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Query('userId') userId: string) {
    return this.campaignService.delete(id, userId);
  }

  @Get()
  findAll() {
    return this.campaignService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.campaignService.findByUser(userId);
  }
}
