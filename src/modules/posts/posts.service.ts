/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { applyFeedAlgorithm } from './utils/feed-algorithm';
import { BaseService } from '../../common/services/base.service';
import {
  BaseQueryDto,
  SortOrder,
  SortType,
} from '../../common/dto/base-query.dto';
import { PostsGateway } from './posts.gateway';

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly postsGateway: PostsGateway,
  ) {
    super(postModel);
  }

  // Create Post
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  // Update Post
  async update(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const updatedPost = await this.postModel.findByIdAndUpdate(
      postId,
      updatePostDto,
      { new: true },
    );

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }

    return updatedPost;
  }

  // Delete Post
  async delete(postId: string): Promise<{ message: string }> {
    const deletedPost = await this.postModel.findByIdAndDelete(postId);
    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
    return { message: 'Post deleted successfully' };
  }

  // Get posts by userId (if provided), otherwise return all posts
  async getUserPosts(userId?: string, query?: BaseQueryDto): Promise<Post[]> {
    const baseQuery = query || {};
    let mongooseQuery = this.model.find();

    // If userId is provided, add it to the base filters
    if (userId) {
      mongooseQuery = mongooseQuery.where('userId', userId);
    }

    // Apply search filter if provided
    if (baseQuery.search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { name: { $regex: baseQuery.search, $options: 'i' } },
          { description: { $regex: baseQuery.search, $options: 'i' } },
        ],
      });
    }

    // Apply sorting
    const sortDirection = baseQuery.order === SortOrder.ASC ? 1 : -1;
    const sortField = baseQuery.sortBy === SortType.NAME ? 'name' : 'createdAt';
    mongooseQuery = mongooseQuery.sort({ [sortField]: sortDirection });

    // Apply user filter if provided and userId is not specified
    if (baseQuery.sortUser && !userId) {
      const User = this.model.db.model('User');
      const matchingUsers = await User.find({
        name: { $regex: baseQuery.sortUser, $options: 'i' },
      }).select('_id');

      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map((user: any) => String(user._id));
        mongooseQuery = mongooseQuery.where('userId').in(userIds);
      } else {
        return [];
      }
    }

    return mongooseQuery.exec();
  }

  // Feed (apply filters + algorithm)
  async getFeed(userId: string, query?: BaseQueryDto): Promise<Post[]> {
    const allPosts = await this.applyFilters(query || {}); // ✅ filter first
    return applyFeedAlgorithm(userId, allPosts); // ✅ then feed algo
  }

  // Toggle like on post
  async toggleLike(postId: string, userId: string): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    const updatedPost = await post.save();
    this.postsGateway.emitPostLikeUpdate(postId, updatedPost.likes);
    return updatedPost;
  }

  // Check if user liked a post
  async isLikedByUser(postId: string, userId: string): Promise<boolean> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post.likes.includes(userId);
  }
}
