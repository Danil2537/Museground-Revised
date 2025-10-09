import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDTO } from './DTO/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<UserDocument> {
    console.log('creating a new user\n');
    if (createUserDTO.password) {
      createUserDTO.password = await bcrypt.hash(createUserDTO.password, 10);
    }

    const newUser = new this.userModel({
      ...createUserDTO,
      provider: createUserDTO.provider ?? 'local',
    });

    return newUser.save();
  }

  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
