import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Advertisement } from './schemas/advertisement.schema';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectModel(Advertisement.name) private adModel: Model<Advertisement>,
  ) {}

  async create(createAdDto: CreateAdDto): Promise<{ message: string }> {
    const ad = new this.adModel(createAdDto);
    await ad.save();
    return { message: 'Advertisement created successfully' };
  }

  async findAll(): Promise<Advertisement[]> {
    return this.adModel.find().exec();
  }

  async findByUser(userId: string): Promise<Advertisement[]> {
    return this.adModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<Advertisement> {
    const ad = await this.adModel.findById(id);
    if (!ad) throw new NotFoundException('Advertisement not found');
    return ad;
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
