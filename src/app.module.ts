import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { AdvertisementsModule } from './modules/advertisements/advertisements.module';
import { ExhibitionsModule } from './modules/exhibitions/exhibitions.module';
import { GalleriesModule } from './modules/galleries/galleries.module';
import { FundraisingModule } from './modules/fundraising/fundraising.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';
import { ModeratorsModule } from './modules/moderators/moderators.module';
import { NoticesModule } from './modules/notices/notices.module';
import { OverviewModule } from './modules/overview/overview.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/ArtPlatform'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PostsModule,
    AdvertisementsModule,
    ExhibitionsModule,
    GalleriesModule,
    FundraisingModule,
    StripeModule,
    ModeratorsModule,
    NoticesModule,
    OverviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
