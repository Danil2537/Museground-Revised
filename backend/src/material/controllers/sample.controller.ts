import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
//import { BaseMaterialController } from './material.controller';
import { MaterialService } from '../material.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSampleDTO } from '../DTO/createSample.dto';
import { FileService } from 'src/files/file.service';
import { SampleDocument } from 'src/schemas/sample.schema';

@Controller('samples')
export class SampleController {
  //extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<SampleDocument>,
    private readonly fileService: FileService,
  ) {
    //super(materialService);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSample(
    @Body() createSampleDto: CreateSampleDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('starting upload sample in sampleController\n');
    const newSample = await this.materialService.create(createSampleDto);
    const fileUpload = await this.fileService.uploadFile({
      key: file.originalname,
      buffer: file.buffer,
      contentType: file.mimetype,
      type: 'sample',
    });
    console.log('adding file url to sample model object\n');
    newSample.fileUrl = fileUpload.url;
    return await newSample.save();
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom sample logic
  //   return super.create(dto);
  // }
}
