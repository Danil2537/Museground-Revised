import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFolderDTO {
  constructor() {
    console.log('Creating a createFolderDTO\n');
  }

  @IsString()
  name: string;

  @IsOptional()
  parent?: Types.ObjectId; // recursive relationship
}
