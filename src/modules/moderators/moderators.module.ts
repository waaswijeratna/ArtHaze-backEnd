import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ModeratorsService } from './moderators.service';
import { ModeratorsController } from './moderators.controller';
import { Moderator, ModeratorSchema } from './schemas/moderator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Moderator.name, schema: ModeratorSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ModeratorsController],
  providers: [ModeratorsService],
})
export class ModeratorsModule {}
