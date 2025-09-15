/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Advertisement } from './schemas/advertisement.schema';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { BaseService } from '../../common/services/base.service';
import {
  BaseQueryDto,
  SortOrder,
  SortType,
} from '../../common/dto/base-query.dto';

@Injectable()
export class AdvertisementsService extends BaseService<Advertisement> {
  constructor(
    @InjectModel(Advertisement.name) private adModel: Model<Advertisement>,
  ) {
    super(adModel);
  }

  async create(createAdDto: CreateAdDto): Promise<{ message: string }> {
    const ad = new this.adModel(createAdDto);
    await ad.save();
    return { message: 'Advertisement created successfully' };
  }

  async findAll(query?: BaseQueryDto): Promise<Advertisement[]> {
    return this.applyFilters(query || {});
  }

  async findByUser(
    userId: string,
    query?: BaseQueryDto,
  ): Promise<Advertisement[]> {
    // Merge query but remove sortUser as we're already filtering by specific userId
    const mergedQuery = { ...query, sortUser: undefined };
    let mongooseQuery = this.adModel.find({ userId });

    // Apply text search if provided
    if (mergedQuery.search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { name: { $regex: mergedQuery.search, $options: 'i' } },
          { description: { $regex: mergedQuery.search, $options: 'i' } },
          { category: { $regex: mergedQuery.search, $options: 'i' } },
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

    return mongooseQuery.exec();
  }

  async findOne(id: string): Promise<Advertisement> {
    try {
      const ad = await this.adModel.findById(id);
      if (!ad) throw new NotFoundException('Advertisement not found');
      return ad;
    } catch (error) {
      throw new Error('Advertisement not found: ' + error.message);
    }
  }

  async update(
    id: string,
    updateAdDto: UpdateAdDto,
  ): Promise<{ message: string }> {
    const updatedAd = await this.adModel.findByIdAndUpdate(id, updateAdDto, {
      new: false, // Prevent fetching the updated document
    });
    if (!updatedAd) throw new NotFoundException('Advertisement not found');
    return { message: 'Advertisement updated successfully' };
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.adModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Advertisement not found');
    return { message: 'Advertisement deleted successfully' };
  }
}
