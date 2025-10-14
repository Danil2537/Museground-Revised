import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BucketService } from 'src/r2bucket/bucket.service';
import { File, FileDocument } from 'src/schemas/file.schema';
import { Folder, FolderDocument } from 'src/schemas/folder.schema';
import { CreateFileDTO } from './DTO/createFile.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
    private bucketService: BucketService,
  ) {}

  async uploadFile(dto: CreateFileDTO) {
    console.log('uploading a file in file service\n');
    // Determine folder
    let fullKey = '';

    if (dto.type === 'sample') {
      fullKey = `samples/${dto.key}`;
    } else if (dto.type === 'preset') {
      fullKey = `presets/${dto.key}`;
    } else if (dto.type === 'pack') {
      fullKey = `packs/${dto.key}`; // dto.key includes nested path inside the pack
    }
    console.log(`full file key: ${fullKey}\n`);

    // Upload to R2
    const { key, url } = await this.bucketService.uploadFile(
      fullKey,
      dto.buffer,
      dto.contentType,
    );

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

  async deleteFile(fileId: string) {
    const file = await this.fileModel.findById(fileId);
    if (!file) throw new BadRequestException(`File ${fileId} not found`);

    // Build full file path (S3 key) using parent folders
    const fileKey = await this.buildFilePath(file);

    // Delete from R2 bucket
    await this.bucketService.deleteFile(fileKey);

    // Delete from Mongo
    await this.fileModel.deleteOne({ _id: file._id });

    return { deleted: true, key: fileKey };
  }

  async getFileById(fileId: string) {
    console.log(`file id: ${fileId}\n`);
    return this.fileModel.findById(fileId);
  }

  /**
   * Construct the full S3 key for a file
   */
  private async buildFilePath(file: FileDocument): Promise<string> {
    if (!file.parent) return file.name; // root files

    const parentFolder = await this.folderModel.findById(file.parent);
    if (!parentFolder)
      throw new BadRequestException(`Parent folder not found\n`);

    const folderPath = await this.getFullFolderPath(parentFolder);
    return `${folderPath}/${file.name.split('/').pop()}`;
    // split in case file.name already contains some path
  }

  /**
   * Recursively constructs full folder path
   * e.g., packs/SampleMusic2000/bass/bass_synth
   */
  private async getFullFolderPath(folder: FolderDocument): Promise<string> {
    const nameChain = [folder.name];
    let currentParent = folder.parent as Types.ObjectId;

    while (currentParent) {
      const parent = await this.folderModel.findById(currentParent);
      if (!parent) break;
      nameChain.unshift(parent.name);
      currentParent = parent.parent as Types.ObjectId;
    }

    return nameChain.join('/');
  }
}
