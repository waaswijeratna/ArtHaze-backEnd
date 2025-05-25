import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FundraisingController } from './fundraising.controller';
import { FundraisingService } from './fundraising.service';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [FundraisingController],
  providers: [FundraisingService],
})
export class FundraisingModule {}
