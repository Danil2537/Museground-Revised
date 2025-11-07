import { Body, Controller, Post } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDTO } from './DTO/createFile.dto';

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  uploadFile(@Body() createFileDTO: CreateFileDTO) {
    //console.log(JSON.stringify(createFileDTO));
    return this.fileService.uploadFile(createFileDTO);
  }

  @Post('download')
  downloadFile(@Body() fileKey: string) {
    //console.log(JSON.stringify(fileKey));
    return this.fileService.downloadFile(fileKey);
  }

  @Post('delete')
  deleteFile(@Body() createFileDTO: CreateFileDTO) {
    //console.log(JSON.stringify(createFileDTO));
    return this.fileService.uploadFile(createFileDTO);
  }
}
