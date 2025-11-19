import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SavedItemModule } from '../savedItems/savedItem.module';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: SavedItem.name,
        schema: SavedItemSchema,
      },
    ]),
    SavedItemModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
