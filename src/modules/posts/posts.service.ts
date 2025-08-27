import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { applyFeedAlgorithm } from './utils/feed-algorithm';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

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
      {
        new: true,
      },
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
  async getUserPosts(userId?: string): Promise<Post[]> {
    if (userId) {
      return this.postModel.find({ userId }).exec();
    }
    return this.postModel.find().exec();
  }

  async addReaction(
    postId: string,
    userId: string,
    reactionName: string,
  ): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if the user has already reacted
    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.userId === userId,
    );

    if (existingReactionIndex !== -1) {
      // If user already reacted, update reaction name
      post.reactions[existingReactionIndex].reactionName = reactionName;
    } else {
      // Otherwise, add a new reaction
      post.reactions.push({ userId, reactionName });
    }

    await post.save();
    return post.toObject();
  }

  async getFeed(userId: string): Promise<Post[]> {
    const allPosts = await this.postModel.find().exec();
    return applyFeedAlgorithm(userId, allPosts);
  }
}
