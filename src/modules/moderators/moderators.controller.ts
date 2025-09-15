import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ModeratorsService } from './moderators.service';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { LoginModeratorDto } from './dto/login-moderator.dto';
import { UpdateModeratorDto } from './dto/update-moderator.dto';
import { Query } from '@nestjs/common';

@Controller('moderators')
export class ModeratorsController {
  constructor(private readonly moderatorsService: ModeratorsService) {}

  @Post('register')
  async register(@Body() createModeratorDto: CreateModeratorDto) {
    return this.moderatorsService.register(createModeratorDto);
  }

  @Post('login')
  async login(@Body() loginModeratorDto: LoginModeratorDto) {
    return this.moderatorsService.login(loginModeratorDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.moderatorsService.refreshToken(refreshToken);
  }

  @Get()
  async getAllModerators(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'name' | 'time',
    @Query('order') order?: 'asc' | 'desc',
    @Query('sortUser') sortUser?: string,
  ) {
    return this.moderatorsService.getAllModerators(
      search,
      sortBy,
      order,
      sortUser,
    );
  }

  @Get(':moderatorId')
  async getModeratorData(@Param('moderatorId') moderatorId: string) {
    return this.moderatorsService.getModeratorData(moderatorId);
  }

  @Put(':moderatorId')
  async updateModerator(
    @Param('moderatorId') moderatorId: string,
    @Body() updateModeratorDto: UpdateModeratorDto,
  ) {
    return this.moderatorsService.updateModerator(
      moderatorId,
      updateModeratorDto,
    );
  }

  @Delete(':moderatorId')
  async deleteModerator(@Param('moderatorId') moderatorId: string) {
    return this.moderatorsService.deleteModerator(moderatorId);
  }
}
