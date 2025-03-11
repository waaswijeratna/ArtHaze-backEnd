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

  @Get()
  async getUserPosts(@Query('userId') userId: string) {
    return this.postsService.getUserPosts(userId);
  }

  @Get('feed')
  async getFeed(@Query('userId') userId: string) {
    return this.postsService.getFeed(userId);
  }
}
