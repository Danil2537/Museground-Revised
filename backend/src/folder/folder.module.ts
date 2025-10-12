import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Folder, FolderSchema } from "../schemas/folder.schema";
import { FolderService } from "./folder.service";
import { FolderController } from "./folder.controller";
import { BucketModule } from "src/r2bucket/bucket.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Folder.name,
        schema: FolderSchema,
      },
    ]),
    BucketModule,
  ],
  providers: [FolderService],
  controllers: [FolderController],
  exports: [FolderService],
})
export class FolderModule {}