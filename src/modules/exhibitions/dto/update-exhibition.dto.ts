// src/exhibitions/dto/update-exhibition.dto.ts
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateExhibitionDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly gallery?: string;

  @IsOptional()
  @IsArray()
  readonly artImages?: string[];

  @IsOptional()
  readonly date?: string;

  @IsOptional()
  @IsString()
  readonly time?: string;

  @IsOptional()
  readonly userId?: string;
}
