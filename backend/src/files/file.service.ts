import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BucketService } from "src/r2bucket/bucket.service";
import { FileDocument } from "src/schemas/file.schema";
import { CreateFileDTO } from "./DTO/createFile.dto";

@Injectable()
export class FileService {
    constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>, private bucketService: BucketService) {}

    async uploadFile(dto: CreateFileDTO) {
    console.log('uploading a file in file service\n');
    // Determine folder
    let folder = '';
    if (dto.type === 'sample') folder = 'samples';
    else if (dto.type === 'preset') folder = 'presets';
    else if (dto.type === 'pack') folder = `packs/${dto.key}`; // for packs, each pack is a folder

    const fullKey = `${folder}/${dto.key}`;
    console.log(`full file key: ${fullKey}\n`);
    // Upload to R2
    const { key, url } = await this.bucketService.uploadFile(fullKey, dto.buffer, dto.contentType);

    // Save file metadata to Mongo
    console.log('saving file data to mongo\n');
    const fileDoc = new this.fileModel({
      name: key,
      url: url,
      type: dto.type,
      contentType: dto.contentType,
      uploadedAt: new Date(),
    });

    return fileDoc.save();
  }

  async downloadFile(key: string) {
    return this.bucketService.getFile(key);
  }

//   async deleteFile(key: string) {
//     // Optional: implement deletion via BucketService and remove Mongo doc
//     await this.bucketService.deleteFile(key);
//     return this.fileModel.findOneAndDelete({ key });
//   }
}