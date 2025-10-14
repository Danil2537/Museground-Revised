import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserMaterialModule } from 'src/userMaterials/userMaterial.module';
import { SavedItem, SavedItemSchema } from 'src/schemas/savedItem.schema';

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
    UserMaterialModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
