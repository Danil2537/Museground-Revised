import { Body, Controller, HttpCode, HttpStatus, Get, UseGuards, Post, Request, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwtauth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string,any>) {
        return this.authService.signIn(signInDto);
    }

    @Get('google')
    @UseGuards(GoogleOauthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async auth() {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('google/callback')
@UseGuards(GoogleOauthGuard)
async googleAuthCallback(@Req() req, @Res() res: Response) {
  const tokenObj = await this.authService.signIn(req.user);

  // tokenObj is { access_token: 'jwtstring' }
  const jwtToken = await this.authService.signIn(req.user); // returns string
    res.cookie('access_token', jwtToken, {
    maxAge: 2592000000,
    sameSite: true,
    secure: false,
    });
    //return res.redirect("http://localhost:3000/auth/profile")
    return res.status(200).send(`Logged in with google, token: ${jwtToken}`);
}
}
