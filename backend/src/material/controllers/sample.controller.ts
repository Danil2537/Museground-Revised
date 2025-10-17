import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  Param,
  Res,
} from '@nestjs/common';
//import { BaseMaterialController } from './material.controller';
import { MaterialService } from '../material.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSampleDTO } from '../DTO/createSample.dto';
import { FileService } from 'src/files/file.service';
import { Sample, SampleDocument } from 'src/schemas/sample.schema';
import { type FilterQuery, Types } from 'mongoose';
import type { Response } from 'express';
import { Stream } from 'stream';
import { UsersService } from 'src/users/users.service';

@Controller('samples')
export class SampleController {
  //extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<SampleDocument>,
    private readonly fileService: FileService,
    private readonly userService: UsersService,
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
    // if (createSampleDto.authorId) {
    //   createSampleDto.authorId = new Types.ObjectId(createSampleDto.authorId);
    // }
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

  @Get('get/:id')
  async getSample(@Param('id') sampleId: string) {
    return await this.materialService.findOne(sampleId);
  }

  @Get('filter/query')
  async getFiltered(@Query() query: Record<string, string>) {
    const filter: FilterQuery<Sample> = {};

    const minBPM = query.minBPM ? Number(query.minBPM) : undefined;
    const maxBPM = query.maxBPM ? Number(query.maxBPM) : undefined;

    if (minBPM !== undefined || maxBPM !== undefined) {
      const bpmFilter: Record<string, number> = {};
      if (minBPM !== undefined) bpmFilter.$gte = minBPM;
      if (maxBPM !== undefined) bpmFilter.$lte = maxBPM;
      filter.BPM = bpmFilter as unknown as Sample['BPM'];
    }

    const stringFields: (keyof Sample)[] = [
      'name',
      'instruments',
      'genres',
      'key',
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

    const samplesWithAuthors = await Promise.all(
      filterResult.map(async (sampleDoc) => {
        const sample = sampleDoc.toObject() as Sample;
        const author = await this.userService.findById(
          sample.authorId.toString(),
        );
        return {
          ...sample,
          authorName: author ? author.username : 'Unknown',
        };
      }),
    );

    return samplesWithAuthors;
  }

  @Get('download/:id')
  async downloadSample(@Param('id') sampleId: string, @Res() res: Response) {
    const toBeDownloaded = await this.materialService.findOne(sampleId);
    if (!toBeDownloaded) throw new BadRequestException('Sample not found');

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
    res.setHeader('Content-Type', 'audio/mpeg');

    // Pipe the stream to the response
    (stream as Stream).pipe(res);
  }

  @Delete('delete/:id')
  async deleteSample(@Param('id') sampleId: string) {
    const toBeDeleted = await this.materialService.findOne(sampleId);
    if (toBeDeleted) {
      const r2 = await this.fileService.deleteFile(
        toBeDeleted.fileId as unknown as string,
      );
      const db = await this.materialService.delete(sampleId);
      return { db: db, r2: r2 };
    } else
      throw new BadRequestException('Sample with specified id not found\n');
  }
}
