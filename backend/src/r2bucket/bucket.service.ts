import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class BucketService {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    try {
      const accessKeyId = this.configService.get<string>(
        'ACCESS_TOKEN_KEY_ID',
      )!;
      const secretAccessKey =
        this.configService.get<string>('SECRET_ACCESS_KEY')!;
      const bucketName = this.configService.get<string>('BUCKET_NAME')!;
      const endpoint = this.configService.get<string>('R2_ENDPOINT')!;

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
        throw new BadRequestException('Missing R2 environment variables');
      }

      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.bucket = bucketName;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return { key, url: this.getPublicUrl(key) };
  }

  async deleteFileByKey(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return { deleted: true, key };
  }

  async createFolder(path: string) {
    if (!path.endsWith('/')) path += '/';
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: '',
      }),
    );
    return { key: path, url: this.getPublicUrl(path) };
  }

  async deleteFile(key: string) {
    console.log(`hit bucket service file deletion, key is: ${key}\n`);
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const commandResult = await this.s3.send(deleteCommand);
    return { deleted: true, key, commandResult };
  }

  async deleteFolder(prefix: string) {
    if (!prefix.endsWith('/')) prefix += '/';

    // List all objects under this prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });
    const listed = await this.s3.send(listCommand);

    // Delete all listed objects
    if (listed.Contents && listed.Contents.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: listed.Contents.map((obj) => ({ Key: obj.Key! })),
        },
      });
      await this.s3.send(deleteCommand);
    }

    return { deleted: true, prefix };
  }

  async getFile(key: string): Promise<Readable> {
    console.log(key, '\n\n');
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return result.Body as Readable;
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('R2_ENDPOINT')!;
    return `${endpoint.replace(/\/+$/, '')}/${key}`;
  }
}
