import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDTO {
    constructor() {console.log("Creating a DTO\n");}

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    hashedPassword: string;
}