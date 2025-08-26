import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice } from './schemas/notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(@InjectModel(Notice.name) private noticeModel: Model<Notice>) {}

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const newNotice = new this.noticeModel(createNoticeDto);
    return newNotice.save();
  }

  async findAll(): Promise<Notice[]> {
    return this.noticeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Notice> {
    const notice = await this.noticeModel.findById(id).exec();
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async update(id: string, updateNoticeDto: UpdateNoticeDto): Promise<Notice> {
    const updatedNotice = await this.noticeModel
      .findByIdAndUpdate(id, updateNoticeDto, { new: true })
      .exec();
    if (!updatedNotice) throw new NotFoundException('Notice not found');
    return updatedNotice;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.noticeModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Notice not found');
    return { message: 'Notice deleted successfully' };
  }
}
