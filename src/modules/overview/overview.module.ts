import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OverviewService } from './overview.service';
import { OverviewController } from './overview.controller';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import {
  Exhibition,
  ExhibitionSchema,
} from '../exhibitions/schemas/exhibition.schema';
import {
  Campaign,
  CampaignSchema,
} from '../fundraising/schemas/campaign.schema';
import {
  Advertisement,
  AdvertisementSchema,
} from '../advertisements/schemas/advertisement.schema';
import { Notice, NoticeSchema } from '../notices/schemas/notice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Advertisement.name, schema: AdvertisementSchema },
      { name: Notice.name, schema: NoticeSchema },
    ]),
  ],
  providers: [OverviewService],
  controllers: [OverviewController],
})
export class OverviewModule {}
