import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePresetDTO {
  constructor() {
    //console.log('creating preset upload dto');
  }

  @IsString()
  name: string;

  @IsString()
  authorId: Types.ObjectId;

  @IsOptional()
  @IsString()
  @IsUrl()
  fileUrl: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  soundFileUrl: string;

  @IsOptional()
  @IsString()
  vst?: string;

  @IsOptional()
  @IsString()
  genres?: string;

  @IsOptional()
  @IsString()
  types?: string;
}
