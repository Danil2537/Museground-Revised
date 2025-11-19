import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';
import { Pack, PackSchema } from '../schemas/pack.schema';
import { Sample, SampleSchema } from '../schemas/sample.schema';
import { Preset, PresetSchema } from '../schemas/preset.schema';
import { SavedItemService } from './savedItem.service';
import { SavedItemController } from './savedItem.controller';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedItem.name, schema: SavedItemSchema },
      { name: Pack.name, schema: PackSchema },
      { name: Sample.name, schema: SampleSchema },
      { name: Preset.name, schema: PresetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SavedItemController],
  providers: [SavedItemService],
  exports: [SavedItemService],
})
export class SavedItemModule {}
