import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwtauth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JwtLoginDto } from './DTO/jwtLoginDto';
import { CreateUserDTO } from 'src/users/DTO/createUser.dto';
import { ProfileRequestDto } from './DTO/profileRequestDto';
import { CurrentUser } from './decorators/user.decorator';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
//import { ProfileRequestDto } from './DTO/profileRequestDto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login-jwt')
  async loginJwt(@Body() loginData: JwtLoginDto, @Res() res: Response) {
    console.log(`starting jwt login, data is: ${JSON.stringify(loginData)}\n`);
    const tokenObj = await this.authService.loginJwt(loginData);

    res.cookie('access_token', tokenObj?.access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get<boolean>('SECURE_COOKIES'),
      maxAge: 2592000000,
    });
    // res.header(
    //   'Access-Control-Allow-Origin',
    //   this.configService.get<string>('FRONTEND_ORIGIN'),
    // );
    // res.header('Access-Control-Allow-Credentials', 'true');

    return res.send({ message: 'Login successful' });
  }

  @Post('register-jwt')
  registerJwt(@Body() registerData: CreateUserDTO) {
    console.log('registerJwt controller data: \n', registerData);
    return this.authService.registerJwt(registerData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: ProfileRequestDto) {
    //console.log(`profile request: ${JSON.stringify(req)}`);
    //const user = await this.authService.getUserById(req.user.id);
    console.log('Opening user profile route\n');
    const dbUser = await this.authService.getUserById(user.id);
    console.log('\n\n', JSON.stringify(user));
    if (dbUser) {
      return {
        username: dbUser.username,
        email: dbUser.email,
      };
    }
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // req.user is now typed from  global.d.ts declaration
    if (req.user) {
      const tokenObj = await this.authService.signInGoogle(req.user);
      if (tokenObj) {
        res.cookie('access_token', tokenObj.access_token, {
          httpOnly: true,
          maxAge: 2592000000,
          sameSite: 'none',
          secure: this.configService.get<boolean>('SECURE_COOKIES'),
        });
      }
    }
    return res.redirect(
      `${this.configService.get<string>('FRONTEND_ORIGIN')}/profile`,
    );
  }
}
