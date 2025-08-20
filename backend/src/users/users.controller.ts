import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDTO } from "./DTO/createUser.dto";

@Controller("users")
export class UsersController
{
    constructor(private usersService: UsersService){}

    @Post("register")
    createUser(@Body() createUserDTO:   CreateUserDTO) {
        console.log(JSON.stringify(createUserDTO));
        return this.usersService.createUser(createUserDTO);
    }
}