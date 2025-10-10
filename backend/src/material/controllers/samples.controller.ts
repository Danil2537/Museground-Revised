import { Controller } from '@nestjs/common';
import { BaseMaterialController } from './material.controller';
import { MaterialService } from '../material.service';

@Controller('samples')
export class SampleController extends BaseMaterialController {
  constructor(service: MaterialService) {
    super(service);
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom sample logic
  //   return super.create(dto);
  // }
}
