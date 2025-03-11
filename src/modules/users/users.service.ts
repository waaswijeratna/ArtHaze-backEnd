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
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ token: string }> {
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
      const token: string = this.jwtService.sign({
        id: newUser._id,
        name,
        email,
        pfpUrl,
        age,
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

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
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

      // Generate JWT token
      const token: string = this.jwtService.sign({
        id: user._id,
        name: user.name,
        pfpUrl: user.pfpUrl,
        email: user.email,
        age: user.age,
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

  // New method to get user data by userId
  async getUserData(userId: string): Promise<{ name: string; pfpUrl: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      return { name: user.name, pfpUrl: user.pfpUrl }; // Return only name and pfpUrl
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error('An unknown error occurred');
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
      const token: string = this.jwtService.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        pfpUrl: user.pfpUrl,
        age: user.age,
      });

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
}
