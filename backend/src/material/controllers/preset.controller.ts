import { Controller } from '@nestjs/common';
import { MaterialService } from '../material.service';
import { PresetDocument } from 'src/schemas/preset.schema';
import { FileService } from 'src/files/file.service';

@Controller('presets')
export class PresetController { //extends BaseMaterialController {
  constructor(private readonly materialService: MaterialService<PresetDocument>, private readonly fileervice: FileService) {
    //super(service);
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom preset logic
  //   return super.create(dto);
  // }
}
