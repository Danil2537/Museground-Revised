import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  constructor() {
    console.log('Creating a DTO\n');
  }

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  password?: string | null;

  @IsNotEmpty()
  provider?: 'local' | 'google';
}
