/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Model, Document } from 'mongoose';
import { BaseQueryDto, SortOrder, SortType } from '../dto/base-query.dto';

export abstract class BaseService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  protected async applyFilters(query: BaseQueryDto): Promise<T[]> {
    const {
      search,
      sortBy = SortType.TIME,
      order = SortOrder.DESC,
      sortUser,
    } = query;

    // Start building the query
    let mongooseQuery = this.model.find();

    // Apply text search if provided
    if (search) {
      mongooseQuery = mongooseQuery.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          // Search in nested gallery object for exhibitions
          { 'gallery.name': { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Determine sort direction
    const sortDirection = order === SortOrder.ASC ? 1 : -1;

    // Apply sorting based on sortBy field
    if (sortBy === SortType.TIME) {
      mongooseQuery = mongooseQuery.sort({ createdAt: sortDirection });
    } else if (sortBy === SortType.NAME) {
      // Sort by either name or title field, depending on which exists
      const modelFields = Object.keys(this.model.schema.paths);
      const sortField = modelFields.includes('name') ? 'name' : 'title';
      mongooseQuery = mongooseQuery.sort({ [sortField]: sortDirection });
    }

    // If user filter is provided, apply it last
    if (sortUser) {
      const User = this.model.db.model('User');
      const matchingUsers = await User.find({
        name: { $regex: sortUser, $options: 'i' },
      }).select('_id');

      // Convert ObjectIds to strings, since exhibition.userId is stored as plain text
      const userIds = matchingUsers.map((user) => user._id.toString());

      if (userIds.length > 0) {
        mongooseQuery = mongooseQuery.where('userId').in(userIds);
      } else {
        return [];
      }
    }

    return mongooseQuery.exec();
  }
}
