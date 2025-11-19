import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from '../schemas/folder.schema';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { BucketModule } from '../r2bucket/bucket.module';
import { File, FileSchema } from '../schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Folder.name,
        schema: FolderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    BucketModule,
  ],
  providers: [FolderService],
  controllers: [FolderController],
  exports: [FolderService],
})
export class FolderModule {}
