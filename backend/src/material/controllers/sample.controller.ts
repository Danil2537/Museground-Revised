import {
    BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { Types } from 'mongoose';

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
    newSample.fileId = fileUpload._id as Types.ObjectId;
    return await newSample.save();
  }

  @Get('sample/:id')
  async getSample(@Body('id') sampleId: string)
  {
    return await this.materialService.findOne(sampleId);
  }

  @Delete('delete/:id')
  async deleteSample(@Body('id') sampleId: string)
  {
    const toBeDeleted = await this.materialService.findOne(sampleId);
    if(toBeDeleted)
    {
    const r2 = await this.fileService.deleteFile(toBeDeleted.fileId as unknown as string);
    const db = await this.materialService.delete(sampleId);
    return {db: db, r2: r2};
    }
    else throw new BadRequestException('Sample with specified id not found\n');
  }

  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom sample logic
  //   return super.create(dto);
  // }
}
