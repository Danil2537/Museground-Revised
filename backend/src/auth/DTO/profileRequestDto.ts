import { IsString } from 'class-validator';

export class ProfileRequestDto {
  @IsString()
  id: string;

  @IsString()
  username: string;
}
