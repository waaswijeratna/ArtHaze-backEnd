/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exhibition } from './schemas/exhibition.schema';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { BaseService } from '../../common/services/base.service';
import {
  BaseQueryDto,
  SortOrder,
  SortType,
} from '../../common/dto/base-query.dto';

@Injectable()
export class ExhibitionsService extends BaseService<Exhibition> {
  constructor(
    @InjectModel('Exhibition')
    private readonly exhibitionModel: Model<Exhibition>,
  ) {
    super(exhibitionModel);
  }

  async createExhibition(
    createExhibitionDto: CreateExhibitionDto,
  ): Promise<Exhibition> {
    const newExhibition = new this.exhibitionModel(createExhibitionDto);
    return await newExhibition.save();
  }

  async findAll(query?: BaseQueryDto): Promise<Exhibition[]> {
    let exhibitions = await this.applyFilters(query || {});

    // Need to populate gallery after applying filters
    exhibitions = await this.exhibitionModel.populate(exhibitions, {
      path: 'gallery',
      select: 'name image',
    });

    return exhibitions;
  }

  async getAllWithGalleryInfo(query?: BaseQueryDto): Promise<Exhibition[]> {
    const mergedQuery = { ...query };
    let mongooseQuery = this.exhibitionModel.find();

    // Apply text search if provided
    if (mergedQuery.search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { name: { $regex: mergedQuery.search, $options: 'i' } },
          { description: { $regex: mergedQuery.search, $options: 'i' } },
          { 'gallery.name': { $regex: mergedQuery.search, $options: 'i' } },
        ],
      });
    }

    // Determine sort direction
    const sortDirection = mergedQuery.order === SortOrder.ASC ? 1 : -1;

    // Apply sorting based on sortBy field
    if (mergedQuery.sortBy === SortType.TIME) {
      mongooseQuery = mongooseQuery.sort({ createdAt: sortDirection });
    } else if (mergedQuery.sortBy === SortType.NAME) {
      mongooseQuery = mongooseQuery.sort({ name: sortDirection });
    }

    let exhibitions = await mongooseQuery.select('name userId gallery').exec();

    // Apply gallery population after filtering
    exhibitions = await this.exhibitionModel.populate(exhibitions, {
      path: 'gallery',
      select: 'name image',
    });

    return exhibitions;
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
  async findByUserId(
    userId: string,
    query?: BaseQueryDto,
  ): Promise<Exhibition[]> {
    // Merge userId into filters
    const mergedQuery = { ...query, sortUser: undefined };
    let mongooseQuery = this.exhibitionModel.find({ userId });

    // Apply text search if provided
    if (mergedQuery.search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { name: { $regex: mergedQuery.search, $options: 'i' } },
          { title: { $regex: mergedQuery.search, $options: 'i' } },
          { description: { $regex: mergedQuery.search, $options: 'i' } },
          { 'gallery.name': { $regex: mergedQuery.search, $options: 'i' } },
        ],
      });
    }

    // Determine sort direction
    const sortDirection = mergedQuery.order === SortOrder.ASC ? 1 : -1;

    // Apply sorting based on sortBy field
    if (mergedQuery.sortBy === SortType.TIME) {
      mongooseQuery = mongooseQuery.sort({ createdAt: sortDirection });
    } else if (mergedQuery.sortBy === SortType.NAME) {
      const modelFields = Object.keys(this.exhibitionModel.schema.paths);
      const sortField = modelFields.includes('name') ? 'name' : 'title';
      mongooseQuery = mongooseQuery.sort({ [sortField]: sortDirection });
    }

    let exhibitions = await mongooseQuery.exec();
    exhibitions = await this.exhibitionModel.populate(exhibitions, {
      path: 'gallery',
      select: 'name image',
    });

    return exhibitions;
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
