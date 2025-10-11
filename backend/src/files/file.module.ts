import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FileSchema } from "src/schemas/file.schema";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
  ],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}