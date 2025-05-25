import { PartialType } from '@nestjs/mapped-types';
import { CreateAdDto } from './create-ad.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateAdDto extends PartialType(CreateAdDto) {}
