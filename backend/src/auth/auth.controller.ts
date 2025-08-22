import { Body, Controller, HttpCode, HttpStatus, Get, UseGuards, Post, Request, Req, Res, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwtauth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import type { Response } from 'express';
import { JwtLoginDto } from './DTO/jwtLoginDto';
import { CreateUserDTO } from 'src/users/DTO/createUser.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    extractJwtFromCookie = (req) => req?.cookies?.access_token;

 
    // @HttpCode(HttpStatus.OK)
    // @Post('login-jwt')
    // loginJwt(@Body() loginData: JwtLoginDto)
    // {
    //     console.log(JSON.stringify(loginData));
    //     return this.authService.loginJwt(loginData);
    // }

    @HttpCode(HttpStatus.OK)
    @Post('login-jwt')
    async loginJwt(
        @Body() loginData: JwtLoginDto,
        @Res() res: Response,
    ) {
        const tokenObj = await this.authService.loginJwt(loginData);

        // Set token in HTTP-only cookie
        res.cookie('access_token', tokenObj.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // set true if using HTTPS
        maxAge: 2592000000, // ~30 days
        });

        return res.send({ message: 'Login successful' });
    }

    @Post('register-jwt')
    registerJwt(@Body() registerData: CreateUserDTO)
    {
        console.log("lalala",registerData);
        return this.authService.registerJwt(registerData);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        console.log(JSON.stringify(req.user));
        const user = await this.authService.getUserById(req.user.id);
        console.log("\n\n",JSON.stringify(user));
        if(user){
            return {
                username: user.username,
                email: user.email,
            };
        }
    }

    @Get('google')
    @UseGuards(GoogleOauthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async auth() {}

    @Get('google/callback')
    @UseGuards(GoogleOauthGuard)
    async googleAuthCallback(@Req() req, @Res() res: Response) {
        const tokenObj = await this.authService.signInGoogle(req.user); // { access_token: string }

        res.cookie('access_token', tokenObj.access_token, {
            httpOnly: true,     // 🔹 prevents JS access
            maxAge: 2592000000, // ~30 days
            sameSite: 'lax',    // safe default
            secure: false,      // true if you’re on https
        });

        // return res.json(tokenObj);
        return res.redirect('http://localhost:3000/profile');
    }

    
}