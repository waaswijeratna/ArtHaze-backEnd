import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/ArtPlatform',
    ),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET ||
        'efe555c77a4c77a2243fcfeda3e7f2654443addf3b4142421ae1906d986f88734f559ca50a97cca9da81f4668a2993cd884e9a59a5ea0bf4379980c4406f5599',
      signOptions: { expiresIn: '5m' },
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/users/login',
        '/users/register',
        '/users/refresh',
        '/moderators/login',
        '/moderators/register',
        '/moderators/refresh',
      )
      .forRoutes('*');
  }
}
