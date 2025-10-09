import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateSampleDTO {
  constructor() {
    console.log('Creating a createSampleDTO\n');
  }
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  fileUrl?: string;

  authorId: Types.ObjectId;

  rootFolder: Types.ObjectId;

  @IsNumber()
  @IsOptional()
  BPM?: number;

  @IsOptional()
  @IsString()
  instruments?: string;

  @IsOptional()
  @IsString()
  genres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4) //like C#m or G♭
  key?: string;
}
