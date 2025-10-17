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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { Preset, PresetDocument } from 'src/schemas/preset.schema';
import { FileService } from 'src/files/file.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePresetDTO } from '../DTO/createPreset.dto';
import { FilterQuery, Types } from 'mongoose';
import type { Response } from 'express';
import { Stream } from 'stream';
import { UsersService } from 'src/users/users.service';

@Controller('presets')
export class PresetController {
  //extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<PresetDocument>,
    private readonly fileService: FileService,
    private readonly userService: UsersService,
  ) {
    //super(service);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'presetFile', maxCount: 1 },
      { name: 'soundFile', maxCount: 1 },
    ]),
  )
  async uploadPreset(
    @Body() createPresetDto: CreatePresetDTO,
    @UploadedFiles()
    files: {
      presetFile?: Express.Multer.File[];
      soundFile?: Express.Multer.File[];
    },
  ) {
    console.log('Starting preset upload...');

    const newPreset = await this.materialService.create(createPresetDto);

    const preset = files.presetFile?.[0];
    const sound = files.soundFile?.[0];

    if (!preset || !sound) {
      throw new Error('Both presetFile and soundFile are required.');
    }

    const presetUpload = await this.fileService.uploadFile({
      key: preset.originalname,
      buffer: preset.buffer,
      contentType: preset.mimetype,
      type: 'preset',
    });

    const soundUpload = await this.fileService.uploadFile({
      key: sound.originalname,
      buffer: sound.buffer,
      contentType: sound.mimetype,
      type: 'preset',
    });

    newPreset.fileUrl = presetUpload.url;
    newPreset.fileId = presetUpload._id as Types.ObjectId;
    newPreset.soundFileUrl = soundUpload.url;
    newPreset.soundFileId = soundUpload._id as Types.ObjectId;

    return await newPreset.save();
  }

  @Get('filter/query')
  async getFiltered(@Query() query: Record<string, string>) {
    const filter: FilterQuery<Preset> = {};

    const stringFields: (keyof Preset)[] = [
      'name',
      'authorId',
      'vst',
      'genres',
      'types',
    ];
    for (const field of stringFields) {
      const value = query[field];
      if (value && value.trim() !== '') {
        filter[field] = { $regex: value.trim(), $options: 'i' } as unknown;
      }
    }

    const authorName = query.author?.trim();
    if (authorName) {
      const searchedUser = await this.userService.findByName(authorName);
      if (searchedUser) {
        filter.authorId = searchedUser._id;
      } else {
        return [];
      }
    }

    const filterResult = await this.materialService.findByConditions(filter);

    const presetsWithAuthors = await Promise.all(
      filterResult.map(async (presetDoc) => {
        const preset = presetDoc.toObject() as Preset;
        const author = await this.userService.findById(
          preset.authorId.toString(),
        );
        return {
          ...preset,
          authorName: author ? author.username : 'Unknown',
        };
      }),
    );

    return presetsWithAuthors;
  }

  @Get('get/:id')
  async getPreset(@Param('id') presetId: string) {
    return await this.materialService.findOne(presetId);
  }

  @Get('download/:id')
  async downloadPreset(@Param('id') presetId: string, @Res() res: Response) {
    const toBeDownloaded = await this.materialService.findOne(presetId);
    if (!toBeDownloaded) throw new BadRequestException('Preset not found');

    const file = await this.fileService.getFileById(
      toBeDownloaded.fileId as unknown as string,
    );
    if (!file) throw new BadRequestException('File not found');

    // Extract key from file URL
    const keyMatch = file.url.match(/\/(samples|presets|packs)\/.+$/);
    if (!keyMatch)
      throw new BadRequestException(`Invalid file URL: ${file.url}`);
    const key = keyMatch[1] ? keyMatch[0].slice(1) : file.name;

    // Get stream from bucket
    const stream = await this.fileService.downloadFile(key);

    // Set headers for download
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.name.split('/').pop()}"`,
    );
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
