import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Preset, PresetSchema } from 'src/schemas/preset.schema';
import { PresetsService } from './presets.service';
import { PresetsController } from './presets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Preset.name,
        schema: PresetSchema,
      },
    ]),
  ],
  providers: [PresetsService],
  controllers: [PresetsController],
  exports: [PresetsService],
})
export class presetsModule {}
