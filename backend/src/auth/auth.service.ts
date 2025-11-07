import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../users/DTO/createUser.dto';
import { UsersService } from '../users/users.service';
import { generateFromEmail } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import { JwtLoginDto } from './DTO/jwtLoginDto';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../schemas/user.schema';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async loginJwt(
    loginData: JwtLoginDto,
  ): Promise<{ access_token: string } | undefined> {
    //console.log(`Starting jwt login in auth service. Login data is: ${JSON.stringify(loginData)}\n`);
    if (!loginData) throw new UnauthorizedException();

    const dbUser = await this.usersService.findOne(loginData.username);
    //console.log(`db user object is: ${JSON.stringify(dbUser)}`);
    if (!dbUser) throw new UnauthorizedException('Specified user not found');

    if (dbUser.provider !== 'local')
      throw new UnauthorizedException('Use Google login for this account');

    if (!(await bcrypt?.compare(loginData.password, dbUser?.password ?? '')))
      throw new UnauthorizedException('Wrong Password');

    return this.issueToken(dbUser);
  }

  async registerJwt(registerData: CreateUserDTO): Promise<UserDocument> {
    //console.log(`starting registerJwt service. registerData is:\n${JSON.stringify(registerData)}\n\n`);
    if (!registerData)
      throw new UnauthorizedException('Incorrect data sent to server');

    const isDuplicateUser = await this.usersService.findByEmail(
      registerData.email,
    );

    if (!isDuplicateUser) return this.usersService.createUser(registerData);

    throw new UnauthorizedException('User with specified email already exists');
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.usersService.findById(id);
  }

  async registerGoogle(
    user: Pick<User, 'username' | 'email'>,
  ): Promise<UserDocument> {
    const newUser: CreateUserDTO = {
      username: user.username ?? generateFromEmail(user.email, 3),
      email: user.email,
      password: null,
      provider: 'google',
    };
    return this.usersService.createUser(newUser);
  }

  async signInGoogle(
    user: Pick<User, 'username' | 'email'>,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findByEmail(user.email);

    if (!existingUser) {
      const dbUser = await this.usersService.createUser({
        username: user.username ?? generateFromEmail(user.email, 3),
        email: user.email,
        password: null,
        provider: 'google',
      });
      return this.issueToken(dbUser);
    }

    if (existingUser.provider === 'local')
      throw new UnauthorizedException(
        'Account already exists with local login. Use password login.',
      );

    return this.issueToken(existingUser);
  }

  async issueToken(user: UserDocument): Promise<{ access_token: string }> {
    //console.log('Issuing a token\n');
    const payload: JwtPayload = {
      sub: user.id as string,
      username: user.username,
    } as JwtPayload;
    const token: string = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}
