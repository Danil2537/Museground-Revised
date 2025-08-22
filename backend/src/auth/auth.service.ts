import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../users/DTO/createUser.dto';
import { UsersService } from '../users/users.service';
import { generateFromEmail } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import { JwtLoginDto } from './DTO/jwtLoginDto';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService){}

    async loginJwt(loginData: JwtLoginDto)
    {
        if(!loginData)
        {
            throw new UnauthorizedException();
        }

        const dbUser = await this.usersService.findOne(loginData.username);
        if(!dbUser)
        {
            throw new UnauthorizedException("Specified user not found");
        }
        if (dbUser.provider !== 'local') 
        {
            throw new UnauthorizedException("Use Google login for this account");
        }
        else
        {
            const isPasswordValid =  await bcrypt.compare(loginData.password, dbUser.password);
            if(isPasswordValid==true)
            {
                return {access_token: await this.jwtService.signAsync({ sub: dbUser.id, username: dbUser.username })};
            }
            else
            {
                throw new UnauthorizedException("Wrong Password");
            }
        }
    }

    async registerJwt(registerData: CreateUserDTO)
    {
        if(!registerData)
        {
            throw new UnauthorizedException("Incorrect data sent to server");
        }

        const isDuplicateUser = await this.usersService.findOne(registerData.username);
        if(!isDuplicateUser)
        {
            return await this.usersService.createUser(registerData);
        }
        else
        {
            throw new UnauthorizedException("User already exists");
        }
    }

    async getUserById(id: string) 
    {
        return this.usersService.findById(id);
    }

    async registerGoogle(user: any) 
    {
        console.log('creating createuserdto from google');
        const newUser: CreateUserDTO = 
        {
            username: user.username ?? generateFromEmail(user.email, 3),
            email: user.email,
            password: null, 
        };
        console.log('dto created\n');

        return this.usersService.createUser(newUser);
    }

    async signInGoogle(user: any) 
    {
        console.log("starting google signIn in auth service\n");
        const existingUser = await this.usersService.findByEmail(user.email);

        if (!existingUser) 
        {
            // First-time login → register
            console.log("trying to register a new user using google info\n")
            const dbUser = await this.registerGoogle(user);
            return {
            access_token: await this.jwtService.signAsync({
                sub: dbUser.id,
                username: dbUser.username,
            }),
            };
        }
        console.log('google user already exists, logging in...\n');
        // Already exists → issue JWT
        return {
            access_token: await this.jwtService.signAsync({
            sub: existingUser.id,
            username: existingUser.username,
            }),
        };
    }
}