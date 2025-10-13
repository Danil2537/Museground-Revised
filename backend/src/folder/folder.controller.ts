import { Body, Controller, Post } from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDTO } from './DTO/createFolder.dto';

@Controller('folders')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post('create')
  async createFolder(@Body() createFolderDto: CreateFolderDTO) {
    console.log('hit create folder cotroller\n');
    console.log(
      `create folder dto inside controller is: ${JSON.stringify(createFolderDto)}\n`,
    );
    return await this.folderService.createFolder(createFolderDto);
  }
}
