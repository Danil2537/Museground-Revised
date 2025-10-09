import { IsString, IsOptional, IsUrl } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePackDTO {
  constructor() {
    console.log('creating a createPackDTO\n');
  }

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsString()
  author: string;

  rootFolder: Types.ObjectId;
}
