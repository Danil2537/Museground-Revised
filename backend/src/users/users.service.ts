import {Injectable} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { CreateUserDTO } from "./DTO/createUser.dto";
import * as bcrypt from "bcrypt"; 

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {console.log("creating user service", userModel)}

  
    async createUser(createUserDTO: CreateUserDTO) {
        console.log("creating a user in user service\n");
        if (createUserDTO.password) 
        {
            createUserDTO.password = await bcrypt.hash(createUserDTO.password, 10);
        }
        const newUser = new this.userModel(createUserDTO);
        return newUser.save();
    }

    async findOne(username: string) {
        return await this.userModel.findOne({username: username}).exec();
    }

    async findById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async findByEmail(email) {
        console.log("serching user by email\n")
        return await this.userModel.findOne({email: email}).exec();
    }
}