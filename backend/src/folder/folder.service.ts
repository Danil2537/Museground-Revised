import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BucketService } from 'src/r2bucket/bucket.service';
import { Folder, FolderDocument } from 'src/schemas/folder.schema';
import { File, FileDocument } from 'src/schemas/file.schema';
import { CreateFolderDTO } from './DTO/createFolder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private bucketService: BucketService,
  ) {}

  async createFolder(createFolderDto: CreateFolderDTO) {
    console.log('Creating folder:', createFolderDto.name);

    const newFolderDb = new this.folderModel({
      name: createFolderDto.name,
      parent: createFolderDto.parent
        ? new Types.ObjectId(createFolderDto.parent)
        : undefined,
    });

    // --- Build full folder path from hierarchy ---
    let folderPath = createFolderDto.name;

    if (createFolderDto.parent) {
      let currentParentId = createFolderDto.parent;
      const nameChain: string[] = [createFolderDto.name];

      while (currentParentId) {
        const parent = await this.folderModel.findById(currentParentId).lean();
        if (!parent) break;

        nameChain.unshift(parent.name); // prepend parent name
        currentParentId = parent.parent as Types.ObjectId; // move up one level
      }

      folderPath = nameChain.join('/'); // e.g., "packs/2025/synths/basslines"
    }

    console.log(`Full folder path resolved: ${folderPath}`);

    // --- Create empty folder in R2 bucket ---
    await this.bucketService.createFolder(folderPath);

    // --- Save folder in MongoDB ---
    return await newFolderDb.save();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addFile(addFileDto: any) {
    throw new NotImplementedException();
  }

  async deleteFolder(folderId: string) {
    const folder = await this.folderModel.findById(folderId);
    if (!folder) throw new BadRequestException(`Folder ${folderId} not found`);

    const folderPath = await this.getFullFolderPath(folder);

    const files = await this.fileModel.find({ parent: folder._id });
    for (const file of files) {
      await this.bucketService.deleteFileByKey(await this.buildFilePath(file));
      await this.fileModel.deleteOne({ _id: file._id });
    }

    const subfolders = await this.folderModel.find({ parent: folder._id });
    for (const sub of subfolders) {
      await this.deleteFolder(sub._id as string); // recursion handles deep trees
    }

    await this.bucketService.deleteFolder(folderPath);
    await this.folderModel.deleteOne({ _id: folder._id });

    return { deleted: true, path: folderPath };
  }

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

  private async buildFilePath(file: FileDocument): Promise<string> {
    if (!file.parent) return file.name; // root files
    const parentFolder = await this.folderModel.findById(file.parent);
    const folderPath = await this.getFullFolderPath(
      parentFolder as FolderDocument,
    );
    return `${folderPath}/${file.name}`;
  }

  async getFolderById(
    folderId: string | Types.ObjectId,
  ): Promise<FolderDocument> {
    const folder = await this.folderModel.findById(folderId);
    if (!folder)
      throw new BadRequestException(`Folder ${folderId as string} not found`);
    return folder;
  }
}
