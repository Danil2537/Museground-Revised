import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../users/DTO/createUser.dto';
import { UsersService } from '../users/users.service';
import { generateFromEmail } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import { JwtLoginDto } from './DTO/jwtLoginDto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async loginJwt(loginData: JwtLoginDto) {
    if (!loginData) {
      throw new UnauthorizedException();
    }

    const dbUser = await this.usersService.findOne(loginData.username);
    if (!dbUser) {
      throw new UnauthorizedException('Specified user not found');
    }
    if (dbUser.provider !== 'local') {
      throw new UnauthorizedException('Use Google login for this account');
    } else {
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        dbUser.password,
      );
      if (isPasswordValid == true) {
        return {
          access_token: await this.jwtService.signAsync({
            sub: dbUser.id,
            username: dbUser.username,
          }),
        };
      } else {
        throw new UnauthorizedException('Wrong Password');
      }
    }
  }

  async registerJwt(registerData: CreateUserDTO) {
    if (!registerData) {
      throw new UnauthorizedException('Incorrect data sent to server');
    }

    const isDuplicateUser = await this.usersService.findOne(
      registerData.username,
    );
    if (!isDuplicateUser) {
      return await this.usersService.createUser(registerData);
    } else {
      throw new UnauthorizedException('User already exists');
    }
  }

  async getUserById(id: string) {
    console.log(`searching user with id: ${id}`);
    return this.usersService.findById(id);
  }

  async registerGoogle(user: any) {
    //console.log('creating createuserdto from google');
    const newUser: CreateUserDTO = {
      username: user.username ?? generateFromEmail(user.email, 3),
      email: user.email,
      password: null,
    };
    //console.log('dto created\n');

    return this.usersService.createUser(newUser);
  }

async signInGoogle(user: any) {
  console.log('Google sign-in payload:', user);

  let existingUser = await this.usersService.findByEmail(user.email);

  if (!existingUser) {
    // First-time Google login → register new
    const dbUser = await this.usersService.createUser({
      username: user.username ?? generateFromEmail(user.email, 3),
      email: user.email,
      password: null,
      provider: 'google',
    });
    return this.issueToken(dbUser);
  }

  // If the user exists but was created with local provider
  if (existingUser.provider === 'local') {
    // Optional: either reject or link Google account
    throw new UnauthorizedException('Account already exists with local login. Use password login.');
  }

  // Otherwise → Google account already exists
  return this.issueToken(existingUser);
}

async issueToken(user: any) {
  return {
    access_token: await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    }),
  };
}
}
