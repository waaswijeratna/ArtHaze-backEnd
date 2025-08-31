import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notice } from './schemas/notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { BaseService } from '../../common/services/base.service';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

@Injectable()
export class NoticesService extends BaseService<Notice> {
  constructor(@InjectModel(Notice.name) private noticeModel: Model<Notice>) {
    super(noticeModel); // ✅ pass model to BaseService
  }

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const newNotice = new this.noticeModel(createNoticeDto);
    return newNotice.save();
  }

  async findAll(query?: BaseQueryDto): Promise<Notice[]> {
    // ✅ reuse BaseService filters
    return this.applyFilters(query || {});
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
