import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preset } from 'src/schemas/preset.schema';
import { PresetDocument } from 'src/schemas/preset.schema';
import { CreatePresetDTO } from './DTO/createPreset.dto';

@Injectable()
export class PresetsService {
  constructor(
    @InjectModel(Preset.name) private presetModel: Model<PresetDocument>,
  ) {}

  createPreset(createPresetDTO: CreatePresetDTO): Promise<PresetDocument> {
    console.log('creating a new preset\n');
    const newPreset = new this.presetModel({ ...createPresetDTO });
    return newPreset.save();
  }
}
