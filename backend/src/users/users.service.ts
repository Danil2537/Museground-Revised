import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDTO } from './DTO/createUser.dto';
import { SaveItemDTO } from './DTO/saveItem.dto';
import * as bcrypt from 'bcrypt';
import { SavedItem, SavedItemDocument } from '../schemas/savedItem.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SavedItem.name)
    private savedItemModel: Model<SavedItemDocument>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<UserDocument> {
    //console.log('creating a new user\n');
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

  async findByName(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async saveItem(saveItemDto: SaveItemDTO) {
    //TODO: add check if saved item is existing
    await new this.savedItemModel(saveItemDto).save();
    const user = await this.userModel.findById(saveItemDto.userId).exec();
    if (user) {
      user.totalDownloads += 1;
      return user.save();
    } else throw new BadRequestException("Couldn't Save Item");
  }

  async getSavedItems(userId: string, type: string) {
    return await this.savedItemModel
      .find({ userId: userId, itemType: type })
      .exec();
  }

  async deleteSavedItem(saveItemDto: SaveItemDTO) {
    return await this.savedItemModel
      .deleteOne({
        userId: saveItemDto.userId,
        itemType: saveItemDto.itemType,
        itemId: saveItemDto.itemId,
      })
      .exec();
  }
}
