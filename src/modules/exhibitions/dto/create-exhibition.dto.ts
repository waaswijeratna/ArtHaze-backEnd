// src/exhibitions/dto/create-exhibition.dto.ts
import { IsArray, IsString } from 'class-validator';

export class CreateExhibitionDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly gallery: string;

  @IsArray()
  readonly artImages: string[];

  readonly date: string;

  @IsString()
  readonly time: string;

  readonly userId: string;
}
