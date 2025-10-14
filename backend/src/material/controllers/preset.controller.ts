import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { PresetDocument } from 'src/schemas/preset.schema';
import { FileService } from 'src/files/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePresetDTO } from '../DTO/createPreset.dto';
import { Types } from 'mongoose';

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
    newPreset.fileId = fileUpload._id as Types.ObjectId;
    return await newPreset.save();
  }

  @Get(':id')
  async getPreset(@Param('id') presetId: string) {
    return await this.materialService.findOne(presetId);
  }

  @Delete('delete/:id')
  async deletePreset(@Body('id') presetId: string) {
    const toBeDeleted = await this.materialService.findOne(presetId);
    if (toBeDeleted) {
      const r2 = await this.fileService.deleteFile(
        toBeDeleted.fileId as unknown as string,
      );
      const db = await this.materialService.delete(presetId);
      return { db: db, r2: r2 };
    } else
      throw new BadRequestException('Preset with specified id not found\n');
  }
}
