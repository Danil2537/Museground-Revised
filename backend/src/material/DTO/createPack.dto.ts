import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePackDTO {
  constructor() {
    console.log('creating preset pack dto');
  }

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsString()
  authorId: string;

  @IsOptional()
  rootFolder: Types.ObjectId;
}
