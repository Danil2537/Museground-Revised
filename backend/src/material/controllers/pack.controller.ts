import { Controller } from '@nestjs/common';
import { BaseMaterialController } from './material.controller';
import { MaterialService } from '../material.service';

@Controller('packs')
export class PackController extends BaseMaterialController {
  constructor(service: MaterialService) {
    super(service);
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom pack logic
  //   return super.create(dto);
  // }
}
