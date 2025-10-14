import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { Preset, PresetDocument } from 'src/schemas/preset.schema';
import { FileService } from 'src/files/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePresetDTO } from '../DTO/createPreset.dto';
import { FilterQuery, Types } from 'mongoose';
import type { Response } from 'express';
import { Stream } from 'stream';

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

  @Get('filter/query')
    async getFiltered(@Query() query: Record<string, any>) {
      const filter: FilterQuery<Preset> = {};
  
      // Convert each string into a case-insensitive regex
      for (const [key, value] of Object.entries(query)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        filter[key] = { $regex: value, $options: 'i' };
      }
  
      return this.materialService.findByConditions(filter);
    }

  @Get('get/:id')
  async getPreset(@Param('id') presetId: string) {
    return await this.materialService.findOne(presetId);
  }

    @Get('download/:id')
  async downloadSample(@Param('id') presetId: string, @Res() res: Response) {
    const toBeDownloaded = await this.materialService.findOne(presetId);
      if (!toBeDownloaded) throw new BadRequestException('Preset not found');
    
      const file = await this.fileService.getFileById(toBeDownloaded.fileId as unknown as string);
      if (!file) throw new BadRequestException('File not found');
    
      // Extract key from file URL
      const keyMatch = file.url.match(/\/(samples|presets|packs)\/.+$/);
      if (!keyMatch) throw new BadRequestException(`Invalid file URL: ${file.url}`);
      const key = keyMatch[1] ? keyMatch[0].slice(1) : file.name;
    
      // Get stream from bucket
      const stream = await this.fileService.downloadFile(key);
    
      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${file.name.split('/').pop()}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
    
      // Pipe the stream to the response
      (stream as Stream).pipe(res);
  }

  @Delete('delete/:id')
  async deletePreset(@Param('id') presetId: string) {
    console.log(presetId);
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
