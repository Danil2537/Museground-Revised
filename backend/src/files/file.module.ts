import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FileSchema } from "src/schemas/file.schema";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { BucketModule } from "src/r2bucket/bucket.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    BucketModule,
  ],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}