import { Controller } from '@nestjs/common';
import { MaterialService } from '../material.service';
import { PackDocument } from 'src/schemas/pack.schema';
import { FileService } from 'src/files/file.service';

@Controller('packs')
export class PackController {//extends BaseMaterialController {
  constructor(private readonly materialService: MaterialService<PackDocument>, private readonly fileService: FileService) {
    //super(service);
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom pack logic
  //   return super.create(dto);
  // }
}
