import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Put(':id')
  async update(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(postId, updatePostDto);
  }

  @Delete(':id')
  async delete(@Param('id') postId: string) {
    return this.postsService.delete(postId);
  }

  // ✅ User posts (respect userId if provided, else filters)
  @Get()
  async getUserPosts(
    @Query('userId') userId: string,
    @Query() query: BaseQueryDto,
  ) {
    return this.postsService.getUserPosts(userId, query);
  }

  // ✅ Feed (filters + algo)
  @Get('feed')
  async getFeed(@Query('userId') userId: string, @Query() query: BaseQueryDto) {
    return this.postsService.getFeed(userId, query);
  }

  @Post(':id/like')
  async toggleLike(
    @Param('id') postId: string,
    @Body('userId') userId: string,
  ) {
    return this.postsService.toggleLike(postId, userId);
  }

  @Get(':id/isLiked')
  async isLikedByUser(
    @Param('id') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.postsService.isLikedByUser(postId, userId);
  }
}
