import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exhibition } from './schemas/exhibition.schema';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

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
    return this.exhibitionModel
      .find()
      .populate('gallery') // ✅ populate full gallery data
      .exec();
  }

  async getAllWithGalleryInfo() {
    return this.exhibitionModel
      .find()
      .populate('gallery', 'name image')
      .select('name userId gallery')
      .exec();
  }

  async getDetailsById(exhibitionId: string) {
    return this.exhibitionModel
      .findById(new Types.ObjectId(exhibitionId))
      .populate('gallery', 'modelUrl')
      .select('name artImages gallery')
      .exec();
  }

  // 🔹 Get exhibitions of a specific user
  // 🔹 Get exhibitions of a specific user (with FULL gallery details)
  async findByUserId(userId: string): Promise<Exhibition[]> {
    return this.exhibitionModel
      .find({ userId })
      .populate('gallery') // ✅ replace gallery id with full gallery object
      .exec();
  }

  // 🔹 Update exhibition
  async updateExhibition(
    id: string,
    updateExhibitionDto: UpdateExhibitionDto,
  ): Promise<Exhibition> {
    const updated = await this.exhibitionModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: updateExhibitionDto }, // explicitly set only provided fields
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Exhibition not found`);
    }

    return updated;
  }

  // 🔹 Delete exhibition
  async deleteExhibition(id: string): Promise<{ message: string }> {
    const result = await this.exhibitionModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!result) {
      throw new NotFoundException(`Exhibition not found`);
    }

    return { message: 'Exhibition deleted successfully' };
  }
}
