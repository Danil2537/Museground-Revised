import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDTO {
  constructor() {
    //console.log('Creating a createFileDTO\n');
  }

  @IsString()
  @IsNotEmpty()
  key: string;

  buffer: Buffer;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  type: 'sample' | 'preset' | 'pack';
}
