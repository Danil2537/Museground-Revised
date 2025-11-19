/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Readable } from 'stream';
import { FileService } from '../files/file.service';
import { File, FileSchema, FileDocument } from '../schemas/file.schema';
import { Folder, FolderSchema, FolderDocument } from '../schemas/folder.schema';
import { BucketService } from '../r2bucket/bucket.service';

import { TestDbModule, closeInMongodConnection } from './test-db.module';

describe('FileService', () => {
  let service: FileService;
  let fileModel: ReturnType<typeof jest.fn> extends never ? never : import('mongoose').Model<FileDocument>;
  let folderModel: ReturnType<typeof jest.fn> extends never ? never : import('mongoose').Model<FolderDocument>;

  const bucketServiceMock: jest.Mocked<BucketService> = {
    uploadFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    deleteFileByKey: jest.fn(),
    createFolder: jest.fn(),
    deleteFolder: jest.fn(),
    getPublicUrl: jest.fn(),
  } as unknown as jest.Mocked<BucketService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule, // Uses MongoMemoryServer
        MongooseModule.forFeature([
          { name: File.name, schema: FileSchema },
          { name: Folder.name, schema: FolderSchema },
        ]),
      ],
      providers: [
        FileService,
        { provide: BucketService, useValue: bucketServiceMock },
      ],
    }).compile();

    service = module.get(FileService);
    fileModel = module.get(getModelToken(File.name));
    folderModel = module.get(getModelToken(Folder.name));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await fileModel.deleteMany({});
    await folderModel.deleteMany({});
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });


  describe('uploadFile', () => {
    it('should upload file and persist metadata', async () => {
      bucketServiceMock.uploadFile.mockResolvedValue({
        key: 'samples/my.wav',
        url: 'https://cdn/my.wav',
      });

      const dto = {
        key: 'my.wav',
        type: 'sample' as const,
        buffer: Buffer.from('abc'),
        contentType: 'audio/wav',
      };

      const saved = await service.uploadFile(dto);

      expect(bucketServiceMock.uploadFile).toHaveBeenCalledWith(
        'samples/my.wav',
        dto.buffer,
        'audio/wav',
      );

      const stored = await fileModel.findById(saved._id).lean();
      expect(stored).toMatchObject({
        name: 'samples/my.wav',
        url: 'https://cdn/my.wav',
      });
    });
  });


  describe('downloadFile', () => {
    it('should delegate to bucketService.getFile', async () => {
      const stream = new Readable({read(){}});
      bucketServiceMock.getFile.mockResolvedValue(stream);

      const result = await service.downloadFile('test.wav');

      expect(bucketServiceMock.getFile).toHaveBeenCalledWith('test.wav');
      expect(result).toBe(stream);
    });
  });


  describe('updateParent', () => {
    it('should update parent field', async () => {
      const folder = await folderModel.create({ name: 'folder' });
      const file = await fileModel.create({
        name: 'file.txt',
        url: 'url',
      });

      const updated = await service.updateParent(file.id as string, folder.id as string);

      expect(updated.parent?.toString()).toBe(folder.id);
    });

    it('should throw when file does not exist', async () => {
      await expect(
        service.updateParent(new Types.ObjectId().toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow('File not found');
    });
  });


  describe('deleteFile', () => {
    it('should delete file and remove from bucket', async () => {
      // folder chain
      const parentA = await folderModel.create({ name: 'packs' });
      const parentB = await folderModel.create({ name: 'bass', parent: parentA._id });

      const file = await fileModel.create({
        name: 'sound.wav',
        url: 'url',
        parent: parentB._id,
      });

      bucketServiceMock.deleteFile.mockResolvedValue({
        deleted: true,
        key: 'packs/bass/sound.wav',
        commandResult: {
            $metadata: {},
        }, 
      });

      const result = await service.deleteFile(file.id as string);

      expect(bucketServiceMock.deleteFile).toHaveBeenCalledWith('packs/bass/sound.wav');
      expect(result).toEqual({
        deleted: true,
        key: 'packs/bass/sound.wav',
      });

      const exists = await fileModel.findById(file.id);
      expect(exists).toBeNull();
    });

    it('should throw when file does not exist', async () => {
      await expect(
        service.deleteFile(new Types.ObjectId().toString()),
      ).rejects.toThrow('File');
    });
  });


  describe('getFileById', () => {
    it('should return an existing file', async () => {
      const file = await fileModel.create({ name: 'a.txt', url: 'url' });

      const found = await service.getFileById(file.id as string);

      expect(found?.id).toBe(file.id);
    });
  });


  describe('buildFilePath', () => {
    it('should return plain file name for root file', async () => {
      const file = await fileModel.create({ name: 'root.wav', url: 'u' });

      const path = await service.buildFilePath(file);

      expect(path).toBe('root.wav');
    });

    it('should build full nested path', async () => {
      const f1 = await folderModel.create({ name: 'packs' });
      const f2 = await folderModel.create({ name: 'bass', parent: f1._id });
      const file = await fileModel.create({
        name: 'clip.wav',
        url: 'u',
        parent: f2._id,
      });

      const path = await service.buildFilePath(file);

      expect(path).toBe('packs/bass/clip.wav');
    });
  });


  describe('getFilesByParent', () => {
    it('should return all files for given parent folder', async () => {
      const folder = await folderModel.create({ name: 'folder' });

      await fileModel.create([
        { name: '1.wav', url: 'u', parent: folder._id },
        { name: '2.wav', url: 'u', parent: folder._id },
      ]);

      const files = await service.getFilesByParent(folder._id as Types.ObjectId);

      expect(files.length).toBe(2);
      expect(files[0].parent?.toString()).toBe(folder.id);
    });
  });
});
