import { Post } from '../schemas/post.schema';

/**
 * Feed Algorithm: Modify this function to apply ranking logic.
 * Currently, it just returns all posts in descending order by creation date.
 */
export function applyFeedAlgorithm(userId: string, posts: Post[]): Post[] {
  return posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
