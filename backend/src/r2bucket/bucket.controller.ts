/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = `test/${Date.now()}_${file.originalname}`;
    console.log(key);
    return this.bucketService.uploadFile(key, file.buffer, file.mimetype);
  }

  @Get(':key/*path')
  async getFile(
    @Param('key') key: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    console.log(key, path, '\n');
    const stream = await this.bucketService.getFile(key + '/' + path);
    stream.pipe(res);
  }

  @Get('signed-url/:fileKey')
  async getSignedUrl(@Param('fileKey') fileKey: string) {
    console.log(`key: ${fileKey}\n\n`);
    const s3: S3Client = this.bucketService['s3'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const bucketName: string = (this.bucketService as any)['bucket'];
    console.log(`bucket name: ${bucketName}\n\n`);
    if (!s3 || !bucketName) {
      throw new Error('Bucket service not initialized properly');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

     
    const url: string = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log(url);
    return { url };
  }
}
