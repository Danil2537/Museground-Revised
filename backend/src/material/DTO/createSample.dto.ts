import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSampleDTO {
  constructor() {
    console.log('creating sample upload dto');
  }

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  authorId: Types.ObjectId;

  //@IsNumber()
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
