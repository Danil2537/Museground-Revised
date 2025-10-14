import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './DTO/createUser.dto';
import { SaveItemDTO } from './DTO/saveItem.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  createUser(@Body() createUserDTO: CreateUserDTO) {
    console.log(JSON.stringify(createUserDTO));
    return this.usersService.createUser(createUserDTO);
  }

  @Post('save-item')
  async saveItem(@Body() saveItemDto: SaveItemDTO) {
    return await this.usersService.saveItem(saveItemDto);
  }

    @Post('delete-saved')
  async deleteSavedItem(@Body() saveItemDto: SaveItemDTO) {
    return await this.usersService.deleteSavedItem(saveItemDto);
  }

  @Get('saved-samples/:userId')
  async getSavedSamples(@Param('userId') userId: string) {
    return await this.usersService.getSavedItems(userId, 'Sample');
  }

  @Get('saved-presets/:userId')
  async getSavedPresets(@Param('userId') userId: string) {
    return await this.usersService.getSavedItems(userId, 'Preset');
  }

  @Get('saved-packs/:userId')
  async getSavedPacks(@Param('userId') userId: string) {
    return await this.usersService.getSavedItems(userId, 'Pack');
  }
}
