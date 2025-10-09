import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePresetDTO {
  constructor() {
    console.log('Creating a createPresetDTO\n');
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsString()
  author: string;

  @IsString()
  @IsUrl()
  fileUrl: string;

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
