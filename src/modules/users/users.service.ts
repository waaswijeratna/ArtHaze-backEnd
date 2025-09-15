/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { User } from './schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';
import { Campaign } from '../fundraising/schemas/campaign.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    private jwtService: JwtService,
  ) {}

  private generateToken(user: User): string {
    return this.jwtService.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        pfpUrl: user.pfpUrl,
        age: user.age,
      },
      {
        expiresIn: '1h',
      },
    );
  }

  //  Refresh token (long-lived, minimal payload)
  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign({ id: userId }, { expiresIn: '7d' });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Find the user
      const user = await this.userModel.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate a fresh access token (with user data)
      const accessToken = this.generateToken(user);

      return { accessToken };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Fallback for unexpected errors
      throw new UnauthorizedException('Failed to process refresh token');
    }
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { name, email, age, pfpUrl, password } = createUserDto;
    try {
      // Check if email already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save new user
      const newUser = new this.userModel({
        name,
        email,
        pfpUrl,
        age,
        password: hashedPassword,
      });
      await newUser.save();

      // Generate JWT token
      const accessToken = this.generateToken(newUser);
      const refreshToken = this.generateRefreshToken(String(newUser._id));

      return { accessToken, refreshToken };
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
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUserDto;
    try {
      // Check if user exists
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare password
      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(String(user._id));

      return { accessToken, refreshToken };
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

  // New method to get user data by userId
  async getUserData(userId: string): Promise<{ name: string; pfpUrl: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      return { name: user.name, pfpUrl: user.pfpUrl };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  async getAllUsers(query?: any): Promise<any[]> {
    try {
      const {
        search,
        sortBy = 'time', // default
        order = 'desc', // default
        sortUser,
      } = query || {};

      let mongooseQuery = this.userModel.find().select('-password');

      // 🔍 Search filter (by name/email)
      if (search) {
        mongooseQuery = mongooseQuery.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        });
      }

      // 👤 SortUser filter (username match)
      if (sortUser) {
        mongooseQuery = mongooseQuery.find({
          name: { $regex: sortUser, $options: 'i' },
        });
      }

      // ⏱ Sorting
      const sortDirection: 1 | -1 = order.toLowerCase() === 'asc' ? 1 : -1;
      if (sortBy.toLowerCase() === 'time') {
        mongooseQuery = mongooseQuery.sort({ createdAt: sortDirection });
      } else if (sortBy.toLowerCase() === 'name') {
        mongooseQuery = mongooseQuery.sort({ name: sortDirection });
      }

      const users = await mongooseQuery.exec();

      // 📊 Attach post/campaign counts
      const usersWithCounts = await Promise.all(
        users.map(async (user) => {
          const postsCount = await this.postModel.countDocuments({
            userId: user._id,
          });
          const campaignsCount = await this.campaignModel.countDocuments({
            userId: user._id,
          });

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            pfpUrl: user.pfpUrl,
            stats: {
              totalPosts: postsCount || 0,
              totalCampaigns: campaignsCount || 0,
            },
          };
        }),
      );

      return usersWithCounts;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; message: string; user: any }> {
    try {
      // Check if user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if email exists (if trying to update email)
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingEmail = await this.userModel.findOne({
          email: updateUserDto.email,
        });
        if (existingEmail) {
          throw new ConflictException('Email already in use');
        }
      }

      // Update user data (only update provided fields)
      Object.assign(user, updateUserDto);
      await user.save();

      // Generate new JWT with updated info
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'User updated successfully',
        user: {
          token,
          id: user._id,
          name: user.name,
          email: user.email,
          pfpUrl: user.pfpUrl,
          age: user.age,
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

  async deleteUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userModel.findByIdAndDelete(userId);

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }
}
