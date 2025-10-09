import { Body, Controller, Post } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { CreateSampleDTO } from './DTO/createSample.dto';

@Controller('samples')
export class SamplesController {
  constructor(private samplesService: SamplesService) {}

  @Post('uploadSample')
  createSample(@Body() createSampleDTO: CreateSampleDTO) {
    console.log(JSON.stringify(createSampleDTO));
    return this.samplesService.createSample(createSampleDTO);
  }
}
