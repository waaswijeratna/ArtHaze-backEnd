import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { BaseService } from '../../common/services/base.service';
import {
  BaseQueryDto,
  SortOrder,
  SortType,
} from '../../common/dto/base-query.dto';

@Injectable()
export class FundraisingService extends BaseService<CampaignDocument> {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {
    super(campaignModel);
  }

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const newCampaign = new this.campaignModel(createCampaignDto);
    return newCampaign.save();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.campaignModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }

  async findAll(query?: BaseQueryDto): Promise<Campaign[]> {
    return this.applyFilters(query || {});
  }

  async findByUser(userId: string, query?: BaseQueryDto): Promise<Campaign[]> {
    // Merge userId into filters but remove sortUser as we're already filtering by specific userId
    const mergedQuery = { ...query, sortUser: undefined };
    let mongooseQuery = this.campaignModel.find({ userId });

    // Apply text search if provided
    if (mergedQuery.search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { title: { $regex: mergedQuery.search, $options: 'i' } },
          { description: { $regex: mergedQuery.search, $options: 'i' } },
        ],
      });
    }

    // Determine sort direction
    const sortDirection = mergedQuery.order === SortOrder.ASC ? 1 : -1;

    // Apply sorting based on sortBy field
    if (mergedQuery.sortBy === SortType.TIME) {
      mongooseQuery = mongooseQuery.sort({ createdAt: sortDirection });
    } else if (mergedQuery.sortBy === SortType.NAME) {
      mongooseQuery = mongooseQuery.sort({ title: sortDirection });
    }

    return mongooseQuery.exec();
  }
}
