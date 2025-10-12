import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BucketService } from "src/r2bucket/bucket.service";
import { Folder, FolderDocument } from "src/schemas/folder.schema";
import { CreateFolderDTO } from "./DTO/createFolder.dto";

@Injectable()
export class FolderService {
    constructor(
        @InjectModel(Folder.name) private folderModel: Model<FolderDocument>, 
        private bucketService: BucketService) 
    {}

    async createFolder(createFolderDto: CreateFolderDTO) {
    console.log('Creating folder:', createFolderDto.name);

    const newFolderDb = new this.folderModel({
        name: createFolderDto.name,
        parent: createFolderDto.parent ? new Types.ObjectId(createFolderDto.parent) : undefined,
    });

    // Build folder path from hierarchy (e.g., "packs/subfolder/")
    let folderPath = createFolderDto.name;

    if (createFolderDto.parent) {
        const parent = await this.folderModel.findById(createFolderDto.parent);
        if (parent) folderPath = `${parent.name}/${folderPath}`;
    }

    // Create empty folder in R2 bucket
    await this.bucketService.createFolder(folderPath);

    // Save folder in MongoDB
    return await newFolderDb.save();
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addFile(addFileDto: any) {
        throw new NotImplementedException();
    }

}