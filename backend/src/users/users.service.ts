import {Injectable} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { CreateUserDTO } from "./DTO/createUser.dto";


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {console.log("creating user service", userModel)}

    // private readonly users = [
    //     {userId: 1, username: 'john', password: 'changeme',},
    //     {userId: 2, username: 'maria', password: 'guess',},
    // ];

    createUser(createUserDTO: CreateUserDTO) {
        const newUser = new this.userModel(createUserDTO);
        return newUser.save();
    }

    async findOne(username: string) {
        return await this.userModel.findOne({username: username}).exec();
        //return this.users.find(user => user.username === username);
    }
}