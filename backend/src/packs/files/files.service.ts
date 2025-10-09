import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from 'src/schemas/file.schema';
import { FileDocument } from 'src/schemas/file.schema';
import { CreateFileDTO } from './DTO/createFile.dto';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  createFile(createFileDTO: CreateFileDTO): Promise<FileDocument> {
    console.log('creating a new file\n');
    const newFile = new this.fileModel({ ...createFileDTO });
    return newFile.save();
  }
}
