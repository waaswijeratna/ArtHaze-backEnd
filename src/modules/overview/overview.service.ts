/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../posts/schemas/post.schema';
import { Exhibition } from '../exhibitions/schemas/exhibition.schema';
import { Campaign } from '../fundraising/schemas/campaign.schema';
import { Advertisement } from '../advertisements/schemas/advertisement.schema';
import { Notice } from '../notices/schemas/notice.schema';

@Injectable()
export class OverviewService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Exhibition.name) private exhibitionModel: Model<Exhibition>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(Advertisement.name)
    private advertisementModel: Model<Advertisement>,
    @InjectModel(Notice.name) private noticeModel: Model<Notice>,
  ) {}

  private async getPostStatistics() {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPosts, dailyPosts, weeklyPosts, monthlyPosts] =
      await Promise.all([
        this.postModel.countDocuments(),
        this.postModel.countDocuments({ createdAt: { $gte: startOfDay } }),
        this.postModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
        this.postModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ]);

    return {
      total: totalPosts,
      timeDistribution: {
        daily: dailyPosts,
        weekly: weeklyPosts,
        monthly: monthlyPosts,
      },
    };
  }

  private async getExhibitionStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalExhibitions, todayExhibitions] = await Promise.all([
      this.exhibitionModel.countDocuments(),
      this.exhibitionModel.countDocuments({
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      total: totalExhibitions,
      todayCount: todayExhibitions,
    };
  }

  private async getCampaignStatistics() {
    const [campaigns, totalRaised] = await Promise.all([
      this.campaignModel.countDocuments(),
      this.campaignModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$fundedAmount' },
          },
        },
      ]),
    ]);

    return {
      totalCampaigns: campaigns,
      totalFundsRaised: totalRaised[0]?.total || 0,
    };
  }

  private async getAdvertisementStatistics() {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAds, dailyAds, weeklyAds, monthlyAds] = await Promise.all([
      this.advertisementModel.countDocuments(),
      this.advertisementModel.countDocuments({
        createdAt: { $gte: startOfDay },
      }),
      this.advertisementModel.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),
      this.advertisementModel.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    return {
      total: totalAds,
      timeDistribution: {
        daily: dailyAds,
        weekly: weeklyAds,
        monthly: monthlyAds,
      },
    };
  }

  private async getNoticeStatistics() {
    const [activeNotices, inactiveNotices] = await Promise.all([
      this.noticeModel.countDocuments({ status: 'active' }),
      this.noticeModel.countDocuments({ status: 'inactive' }),
    ]);

    return {
      total: activeNotices + inactiveNotices,
      active: activeNotices,
      inactive: inactiveNotices,
    };
  }

  async getOverviewStatistics() {
    const [postStats, exhibitionStats, campaignStats, adStats, noticeStats] =
      await Promise.all([
        this.getPostStatistics(),
        this.getExhibitionStatistics(),
        this.getCampaignStatistics(),
        this.getAdvertisementStatistics(),
        this.getNoticeStatistics(),
      ]);

    return {
      posts: postStats,
      exhibitions: exhibitionStats,
      campaigns: campaignStats,
      advertisements: adStats,
      notices: noticeStats,
    };
  }
}
