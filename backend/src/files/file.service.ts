import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FileDocument } from "src/schemas/file.schema";

@Injectable()
export class FileService {
    constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

    uploadFile(createFileDto: any) {
        console.log(createFileDto);
        throw new  NotImplementedException('file uploading not implemented'); 
    }
}