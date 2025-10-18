import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MaterialService } from '../material.service';
import { Pack, PackDocument } from 'src/schemas/pack.schema';
import { FileService } from 'src/files/file.service';
import { CreatePackDTO } from '../DTO/createPack.dto';
import { FolderService } from 'src/folder/folder.service';
import { FilterQuery, Types } from 'mongoose';
import { PACK_FOLDER_ID } from '../constants';
import { CreateFolderDTO } from 'src/folder/DTO/createFolder.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Stream } from 'stream';
import archiver from 'archiver';
import { UsersService } from 'src/users/users.service';

@Controller('packs')
export class PackController {
  //extends BaseMaterialController {
  constructor(
    private readonly materialService: MaterialService<PackDocument>,
    private readonly fileService: FileService,
    private readonly folderService: FolderService,
    private readonly userService: UsersService,
  ) {
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

  @Post('add-folder')
  async addFolder(@Body() createfolderDto: CreateFolderDTO) {
    return await this.folderService.createFolder(createfolderDto);
  }

  @Post('add-file')
  @UseInterceptors(FileInterceptor('file'))
  async addFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('key') key: string,
    @Body('type') type: 'sample' | 'preset' | 'pack',
    @Body('parent') parent?: string,
  ) {
    console.log(`key ${key}\n`);
    const savedFile = await this.fileService.uploadFile({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
      type,
    });

    if (parent) {
      savedFile.parent = new Types.ObjectId(parent);
      await savedFile.save();
    }

    return savedFile;
  }

  @Delete('delete-folder')
  async deleteFolder(@Body('folderId') folderId: string) {
    return await this.folderService.deleteFolder(folderId);
  }

  @Delete('delete-file')
  async deleteFile(@Body() body: { fileId: string }) {
    if (!body || !body.fileId) {
      throw new BadRequestException('Missing fileId in request body');
    }

    console.log(`Deleting file with id: ${body.fileId}`);
    const result = await this.fileService.deleteFile(body.fileId);
    return result;
  }

  @Get(':id')
  async getPack(@Param('id') packId: string) {
    return this.materialService.findOne(packId);
  }

  @Post('move-item')
  async moveItem(
    @Body()
    body: {
      itemId: string;
      itemType: 'file' | 'folder';
      newParentId: string;
    },
  ) {
    const { itemId, itemType, newParentId } = body;
    if (itemType === 'file') {
      return await this.fileService.updateParent(itemId, newParentId);
    } else if (itemType === 'folder') {
      return await this.folderService.updateParent(itemId, newParentId);
    }
    throw new BadRequestException('Invalid item type');
  }

  @Get('find/query')
  async findPacks(@Query() query: Record<string, string>) {
    const filter: FilterQuery<Pack> = {};
    console.log(query);
    const value = query['name'];
    if (value && value.trim() !== '') {
      filter['name'] = { $regex: value.trim(), $options: 'i' } as unknown;
    }
    if (query['author'] && query['author'].trim() !== '') {
      const authorName = query['author'].trim();
      if (authorName) {
        const searchedUser = await this.userService.findByName(authorName);
        if (searchedUser) {
          filter.authorId = searchedUser._id;
        } else {
          return [];
        }
      }
    }
    console.log(`pack filter: ${JSON.stringify(filter)}\n\n`);
    const filterResult = await this.materialService.findByConditions(filter);
    console.log(`pack filter results: ${JSON.stringify(filterResult)}\n\n`);
    const packsWithAuthors = await Promise.all(
      filterResult.map(async (packDoc) => {
        const pack = packDoc.toObject() as Pack;
        const author = await this.userService.findById(
          pack.authorId.toString(),
        );
        return {
          ...pack,
          authorName: author ? author.username : 'Unknown',
        };
      }),
    );

    return packsWithAuthors;
  }

  @Get('file-urls/:id')
  async getPackFileUrls(@Param('id') packId: string) {
    const pack = await this.materialService.findOne(packId);
    if (pack) {
      const children = await this.folderService.findChildren(
        pack.rootFolder._id,
      );
      console.log(`folders: ${JSON.stringify(children)}\n\n`);
      children.unshift(
        await this.folderService.getFolderById(pack.rootFolder._id),
      );
      const files = await Promise.all(
        children.map((c) =>
          this.fileService.getFilesByParent(c._id as Types.ObjectId),
        ),
      );
      console.log(`files: ${JSON.stringify(files)}\n\n`);
      return { fodlers: children, files: files };
    } else throw new BadRequestException('Pack not found');
  }

  @Delete('delete-pack')
  async deletePack(@Body('packId') packId: string) {
    const pack = await this.materialService.findOne(packId);
    if (!pack) throw new BadRequestException('Pack not found');

    const folderDeletion = pack.rootFolder
      ? await this.folderService.deleteFolder(pack.rootFolder.toString())
      : null;

    const dbDeletion = await this.materialService.delete(packId);

    return { db: dbDeletion, bucket: folderDeletion };
  }

  @Get('download-file/:fileId')
  async downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.fileService.getFileById(fileId);
    if (!file) throw new BadRequestException('File not found');

    // Get full S3/R2 key using folder hierarchy
    const key = await this.fileService['buildFilePath'](file);

    // Get file stream
    const stream = await this.fileService.downloadFile(key);

    // Set headers for download
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.name.split('/').pop()}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');

    (stream as Stream).pipe(res);
  }

  @Get('download-folder/:folderId')
  async downloadFolder(
    @Param('folderId') folderId: string,
    @Res() res: Response,
  ) {
    const folder = await this.folderService.getFolderById(folderId);
    if (!folder) throw new BadRequestException('Folder not found');

    // Resolve full folder path in bucket
    const folderPath = await this.folderService['getFullFolderPath'](folder);

    console.log(
      `folder id ${folderId},\n folder data: ${JSON.stringify(folder)},\n folderPath: ${folderPath}\n`,
    );

    // Set ZIP headers
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${folder.name}.zip"`,
    );
    res.setHeader('Content-Type', 'application/zip');

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      throw new BadRequestException(err.message);
    });
    archive.pipe(res);

    // Recursively add files from folder
    const addFilesRecursively = async (folderId: Types.ObjectId) => {
      // get files in this folder
      const files = await this.fileService.getFilesByParent(folderId);
      for (const file of files) {
        //const key = await this.fileService.buildFilePath(file);
        const key = file.name;
        console.log(`key: ${key},\n filename: ${file.name.split('/').pop()}\n`);
        const fileStream = await this.fileService.downloadFile(key);
        archive.append(fileStream, {
          name: file.name.split('/').pop() ?? 'unknown',
        });
      }

      // get subfolders
      const subfolders = await this.folderService.getSubfolders(folderId);
      for (const sub of subfolders) {
        await addFilesRecursively(sub._id as Types.ObjectId);
      }
    };

    await addFilesRecursively(folder._id as Types.ObjectId);

    await archive.finalize();
  }
}
