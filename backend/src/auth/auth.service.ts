import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../users/DTO/createUser.dto';
import { UsersService } from '../users/users.service';
import { generateFromEmail } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService){}

    async generateJwt(payload: any) {
        return await this.jwtService.signAsync(payload);
    }

    async signIn(user) {
    if (!user) {
        throw new UnauthorizedException();
    }

    // Use email as the username for OAuth users
    const username = user.username.split('@')[0] ?? user.email.split('@')[0];
    console.log(username);
    const userExists = await this.usersService.findOne(username);

    if (!userExists) {
        // Generate a random password (since OAuth users don't log in with it)
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const dto: CreateUserDTO = {
        username,
        email: user.email,
        hashedPassword,
        };

        const newUser = await this.usersService.createUser(dto);
        return this.generateJwt({ sub: newUser.id, username: newUser.username });
    }

    return this.generateJwt({ sub: userExists.id, username: userExists.username });
    }

    async registerUser(user: CreateUserDTO)
    {
        try 
        {
            const newUser = await this.usersService.createUser(user);
            return this.generateJwt({sub: newUser.id, username: newUser.username})
        }
        catch 
        {
            throw new InternalServerErrorException();
        }
    }

    async findUserByUsername(username)
    {
        const user = this.usersService.findOne(username);

        if(!user)
        {
            return null;
        }
        return user;
    }
}
    // async signIn(username: string, pass: string): Promise<{access_token: string}> {
    //     const user = await this.usersService.findOne(username);
    //     if(user?.password !== pass) {
    //         throw new UnauthorizedException();
    //     }   
    //     const payload = {sub: user.userId, username: user.username};
    //     return {
    //         access_token: await this.jwtService.signAsync(payload),
    //     };
    // }

