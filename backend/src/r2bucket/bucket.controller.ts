import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BucketService } from './bucket.service';
import type { Response } from 'express';

@Controller('bucket')
export class BucketController {
  constructor(private readonly bucket: BucketService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = `test/${Date.now()}_${file.originalname}`;
    console.log(key);
    return this.bucket.uploadFile(key, file.buffer, file.mimetype);
  }

  @Get(':key/*path')
  async getFile(
    @Param('key') key: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    console.log(key, path, '\n');
    const stream = await this.bucket.getFile(key + '/' + path);
    stream.pipe(res);
  }
}
