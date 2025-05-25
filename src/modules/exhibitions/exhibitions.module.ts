import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExhibitionsController } from './exhibitions.controller';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionSchema } from './schemas/exhibition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Exhibition', schema: ExhibitionSchema },
    ]),
  ],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService],
})
export class ExhibitionsModule {}
