/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { FolderService } from '../folder/folder.service';
import { Folder, FolderSchema } from '../schemas/folder.schema';
import { File, FileSchema } from '../schemas/file.schema';
import { BucketService } from '../r2bucket/bucket.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { TestDbModule, closeInMongodConnection } from './test-db.module';
import { Types } from 'mongoose';

describe('FolderService (with in-memory MongoDB)', () => {
  let service: FolderService;
  let folderModel: any;
  let fileModel: any;

  const bucketServiceMock: Partial<BucketService> = {
    createFolder: jest.fn(),
    deleteFileByKey: jest.fn(),
    deleteFolder: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        MongooseModule.forFeature([
          { name: Folder.name, schema: FolderSchema },
          { name: File.name, schema: FileSchema },
        ]),
      ],
      providers: [
        FolderService,
        { provide: BucketService, useValue: bucketServiceMock },
      ],
    }).compile();

    service = module.get(FolderService);
    folderModel = module.get(getModelToken(Folder.name));
    fileModel = module.get(getModelToken(File.name));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await folderModel.deleteMany({});
    await fileModel.deleteMany({});
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should create a folder', async () => {
    (bucketServiceMock.createFolder as jest.Mock).mockResolvedValue({ key: 'bass/', url: 'url' });

    const folder = await service.createFolder({ name: 'bass' });

    expect(folder.name).toBe('bass');
    expect(bucketServiceMock.createFolder).toHaveBeenCalledWith('bass');
  });

  it('should create a nested folder', async () => {
    const parent = await folderModel.create({ name: 'packs' });

    (bucketServiceMock.createFolder as jest.Mock).mockResolvedValue({ key: 'packs/synths/', url: 'url' });

    const folder = await service.createFolder({ name: 'synths', parent: parent._id.toString() });

    expect(folder.name).toBe('synths');
    expect(bucketServiceMock.createFolder).toHaveBeenCalledWith('packs/synths');
  });

  it('should get folder with files and children', async () => {
    const parent = await folderModel.create({ name: 'packs' });
    await folderModel.create({ name: 'sub', parent: parent._id });
    await fileModel.create({ name: 'file.wav', url: 'url', parent: parent._id });

    const result = await service.getFolderWithChildrenAndFiles(parent._id as Types.ObjectId);

    expect(result.files).toHaveLength(1);
    expect(result.children).toHaveLength(1);
  });
});
