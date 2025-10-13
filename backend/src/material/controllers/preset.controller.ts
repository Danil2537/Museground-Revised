import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { PresetDocument } from 'src/schemas/preset.schema';
import { FileService } from 'src/files/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePresetDTO } from '../DTO/createPreset.dto';

@Controller('presets')
export class PresetController {
  //extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<PresetDocument>,
    private readonly fileService: FileService,
  ) {
    //super(service);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPreset(
    @Body() createPresetDto: CreatePresetDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('starting upload preset in presetController\n');
    const newPreset = await this.materialService.create(createPresetDto);
    const fileUpload = await this.fileService.uploadFile({
      key: file.originalname,
      buffer: file.buffer,
      contentType: file.mimetype,
      type: 'preset',
    });
    console.log('adding file url to preset model object\n');
    newPreset.fileUrl = fileUpload.url;
    return await newPreset.save();
  }
  // Example of overriding:
  // Add custom filtering or validation
  // @Post()
  // async create(@Body() dto) {
  //   // custom preset logic
  //   return super.create(dto);
  // }
}
