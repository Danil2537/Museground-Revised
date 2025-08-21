import {Injectable} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { CreateUserDTO } from "./DTO/createUser.dto";
import * as bcrypt from "bcrypt"; 

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {console.log("creating user service", userModel)}

    // private readonly users = [
    //     {userId: 1, username: 'john', password: 'changeme',},
    //     {userId: 2, username: 'maria', password: 'guess',},
    // ];

    async createUser(createUserDTO: CreateUserDTO) {
        createUserDTO.password = await bcrypt.hash(createUserDTO.password, 10);
        const newUser = new this.userModel(createUserDTO);
        return newUser.save();
    }

    async findOne(username: string) {
        return await this.userModel.findOne({username: username}).exec();
    }

    async findById(id: string) {
        return this.userModel.findById(id).exec();
    }
}