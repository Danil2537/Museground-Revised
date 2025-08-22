import { IsString, MinLength } from 'class-validator';

export class JwtLoginDto {
  @IsString()
  username: string;

  @IsString()
  //@MinLength(6)
  password: string;
}