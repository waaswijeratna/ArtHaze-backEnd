import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Moderator } from './schemas/moderator.schema';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { LoginModeratorDto } from './dto/login-moderator.dto';
import { UpdateModeratorDto } from './dto/update-moderator.dto';

@Injectable()
export class ModeratorsService {
  constructor(
    @InjectModel(Moderator.name) private moderatorModel: Model<Moderator>,
    private jwtService: JwtService,
  ) {}

  async register(
    createModeratorDto: CreateModeratorDto,
  ): Promise<{ token: string }> {
    const { name, email, age, pfpUrl, password, role } = createModeratorDto;
    try {
      // Check if email already exists
      const existingModerator = await this.moderatorModel.findOne({ email });
      if (existingModerator) {
        throw new ConflictException('Email already exists');
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save new moderator
      const newModerator = new this.moderatorModel({
        name,
        email,
        pfpUrl,
        age,
        role: role || 'super',
        password: hashedPassword,
      });
      await newModerator.save();

      // Generate JWT token
      const token: string = this.jwtService.sign({
        id: newModerator._id,
        name,
        email,
        pfpUrl,
        age,
        role,
      });

      return { token };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        const message = error.message;
        throw new Error(message);
      }
      throw new Error('An unknown error occurred');
    }
  }

  async login(
    loginModeratorDto: LoginModeratorDto,
  ): Promise<{ token: string }> {
    const { email, password } = loginModeratorDto;
    try {
      // Check if moderator exists
      const moderator = await this.moderatorModel.findOne({ email });
      if (!moderator) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare password
      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        moderator.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const token: string = this.jwtService.sign({
        id: moderator._id,
        name: moderator.name,
        pfpUrl: moderator.pfpUrl,
        email: moderator.email,
        age: moderator.age,
        role: moderator.role,
      });

      return { token };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        const message = error.message;
        throw new Error(message);
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Get all moderators
  async getAllModerators(): Promise<Moderator[]> {
    try {
      const moderators = await this.moderatorModel.find().select('-password');
      return moderators;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Get moderator data by moderatorId
  async getModeratorData(
    moderatorId: string,
  ): Promise<{ name: string; pfpUrl: string }> {
    try {
      const moderator = await this.moderatorModel.findById(moderatorId);
      if (!moderator) {
        throw new HttpException('Moderator not found', 404);
      }

      return { name: moderator.name, pfpUrl: moderator.pfpUrl }; // Return only name and pfpUrl
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  async updateModerator(
    moderatorId: string,
    updateModeratorDto: UpdateModeratorDto,
  ): Promise<{ success: boolean; message: string; moderator: any }> {
    try {
      // Check if moderator exists
      const moderator = await this.moderatorModel.findById(moderatorId);
      if (!moderator) {
        throw new NotFoundException('Moderator not found');
      }

      // Check if email exists (if trying to update email)
      if (
        updateModeratorDto.email &&
        updateModeratorDto.email !== moderator.email
      ) {
        const existingEmail = await this.moderatorModel.findOne({
          email: updateModeratorDto.email,
        });
        if (existingEmail) {
          throw new ConflictException('Email already in use');
        }
      }

      // Update moderator data (only update provided fields)
      Object.assign(moderator, updateModeratorDto);
      await moderator.save();

      // Generate new JWT with updated info
      const token: string = this.jwtService.sign({
        id: moderator._id,
        name: moderator.name,
        email: moderator.email,
        pfpUrl: moderator.pfpUrl,
        age: moderator.age,
        role: moderator.role,
      });

      return {
        success: true,
        message: 'Moderator updated successfully',
        moderator: {
          token,
          id: moderator._id,
          name: moderator.name,
          email: moderator.email,
          pfpUrl: moderator.pfpUrl,
          age: moderator.age,
          role: moderator.role,
        },
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async deleteModerator(
    moderatorId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const moderator = await this.moderatorModel.findById(moderatorId);
      if (!moderator) {
        throw new NotFoundException('Moderator not found');
      }

      await this.moderatorModel.findByIdAndDelete(moderatorId);

      return {
        success: true,
        message: 'Moderator deleted successfully',
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }
}
