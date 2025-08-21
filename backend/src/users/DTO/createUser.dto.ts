import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDTO {
    constructor() {console.log("Creating a DTO\n");}

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}