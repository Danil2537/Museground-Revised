import { Body, Controller, Post } from '@nestjs/common';
import { MaterialService } from '../material.service';
import { PackDocument } from 'src/schemas/pack.schema';
import { FileService } from 'src/files/file.service';
import { CreatePackDTO } from '../DTO/createPack.dto';
import { FolderService } from 'src/folder/folder.service';
import { Types } from 'mongoose';
import { PACK_FOLDER_ID } from '../constants';

@Controller('packs')
export class PackController {//extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<PackDocument>, 
    private readonly fileService: FileService,
    private readonly folderService: FolderService) {
    //super(service);
  }

  //add, delete, add folder(parent?), add file(file, parent)

  @Post('create')
    async createPack(@Body() createPackDto: CreatePackDTO) {
    const newPack = await this.materialService.create(createPackDto);

    // Create the subfolder for this pack inside the main "packs" folder
    const packFolder = await this.folderService.createFolder({
        name: createPackDto.name,
        parent: PACK_FOLDER_ID, // valid ObjectId
    });

    // Link the new folder to the Pack document
    newPack.rootFolder = packFolder._id as Types.ObjectId;
    return await newPack.save();
    }
}
