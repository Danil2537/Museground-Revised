import {
  IsString,
  IsNumber,
  IsUrl,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFileDTO {
  constructor() {
    console.log('Creating a createFileDTO\n');
  }

  @IsString()
  name: string;

  @IsNumber()
  size: number; //probably in megs

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsOptional()
  parent?: Types.ObjectId;
}
