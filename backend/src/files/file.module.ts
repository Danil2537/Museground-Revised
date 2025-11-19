import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../schemas/file.schema';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { BucketModule } from '../r2bucket/bucket.module';
import { Folder, FolderSchema } from '../schemas/folder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Folder.name,
        schema: FolderSchema,
      },
    ]),
    BucketModule,
  ],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
