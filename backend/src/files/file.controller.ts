import { Body, Controller, Post } from "@nestjs/common";
import { FileService } from "./file.service";

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) 
  {}

 @Post('upload')
  uploadFile(@Body() createFileDTO: any) {
    console.log(JSON.stringify(createFileDTO));
    return this.fileService.uploadFile(createFileDTO);
  }  
}