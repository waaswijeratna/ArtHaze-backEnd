import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class FundraisingService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const newCampaign = new this.campaignModel(createCampaignDto);
    return newCampaign.save();
  }

  async delete(id: string, userId: string): Promise<{ deleted: boolean }> {
    const result = await this.campaignModel.deleteOne({ _id: id, userId });
    return { deleted: result.deletedCount > 0 };
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<Campaign[]> {
    return this.campaignModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
