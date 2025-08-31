import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortType {
  TIME = 'time',
  NAME = 'name',
}

export class BaseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortUser?: string;

  @IsOptional()
  @IsEnum(SortType)
  sortBy?: SortType = SortType.TIME;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}
