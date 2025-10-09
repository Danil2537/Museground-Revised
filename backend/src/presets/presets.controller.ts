import { Body, Controller, Post } from '@nestjs/common';
import { PresetsService } from './presets.service';
import { CreatePresetDTO } from './DTO/createPreset.dto';

@Controller('presets')
export class PresetsController {
  constructor(private presetsService: PresetsService) {}

  @Post('uploadPreset')
  createPreset(@Body() createPresetDTO: CreatePresetDTO) {
    console.log(JSON.stringify(createPresetDTO));
    return this.presetsService.createPreset(createPresetDTO);
  }
}
