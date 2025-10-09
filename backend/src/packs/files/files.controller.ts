import { Body, Controller, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDTO } from './DTO/createFile.dto';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('uploadFile')
  createFile(@Body() createFileDTO: CreateFileDTO) {
    console.log(JSON.stringify(createFileDTO));
    return this.filesService.createFile(createFileDTO);
  }
}
