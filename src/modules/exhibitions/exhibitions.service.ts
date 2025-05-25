// src/exhibitions/exhibitions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exhibition } from './schemas/exhibition.schema';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  constructor(
    @InjectModel('Exhibition')
    private readonly exhibitionModel: Model<Exhibition>,
  ) {}

  async createExhibition(
    createExhibitionDto: CreateExhibitionDto,
  ): Promise<Exhibition> {
    const newExhibition = new this.exhibitionModel(createExhibitionDto);
    return await newExhibition.save();
  }

  async findAll(): Promise<Exhibition[]> {
    return this.exhibitionModel.find().exec();
  }

  async getAllWithGalleryInfo() {
    return this.exhibitionModel
      .find()
      .populate('gallery', 'name image') // only fetch name and image from gallery
      .select('name userId gallery') // only select what you need from exhibition
      .exec();
  }

  async getDetailsById(exhibitionId: string) {
    console.log('Received exhibitionId:', exhibitionId);
    return this.exhibitionModel
      .findById(new Types.ObjectId(exhibitionId))
      .populate('gallery', 'modelUrl')
      .select('name artImages gallery')
      .exec();
  }
}
