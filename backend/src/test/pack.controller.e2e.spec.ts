/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from '../schemas/pack.schema';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';
import { FileModule } from '../files/file.module';
import { UsersModule } from '../users/users.module';
import { FolderModule } from '../folder/folder.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import { ConfigModule } from '@nestjs/config';
import { FileService } from '../files/file.service';
import { FolderService } from '../folder/folder.service';
import { Readable } from 'stream';
import { MaterialService } from '../material/material.service';
describe('PackController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let packModel: Model<Pack>;

  const mockFileService = {
    uploadFile: jest.fn().mockImplementation((file) =>
      Promise.resolve({
        _id: new Types.ObjectId().toHexString(),
        url: `mock://files/${file.key}`,
        name: file.key,
        save: jest.fn().mockResolvedValue(true),
      }),
    ),
    deleteFile: jest.fn().mockResolvedValue(true),
    getFileById: jest
      .fn()
      .mockImplementation((id) =>
        Promise.resolve({ _id: id, name: `mock_${id}`, save: jest.fn() }),
      ),
    buildFilePath: jest
      .fn()
      .mockImplementation((file) => Promise.resolve(file.name)),
    downloadFile: jest.fn().mockImplementation(() => {
      const stream = new Readable();
      stream._read = () => {}; // no-op
      stream.push('mock file content'); // push some data
      stream.push(null); // end the stream
      return stream;
    }),

    getFilesByParent: jest.fn().mockResolvedValue([]),
  };

  const rootFolderId = new Types.ObjectId().toHexString();
  const subFolderId = new Types.ObjectId().toHexString();
  const mockFolderService = {
    createFolder: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({
          _id: dto.parent ? subFolderId : rootFolderId,
          name: dto.name,
          parent: dto.parent,
        }),
      ),
    getFolderById: jest
      .fn()
      .mockImplementation((id) =>
        Promise.resolve({ _id: id, name: `folder_${id}` }),
      ),
    getSubfolders: jest.fn().mockImplementation((parentId) => {
      if (parentId === rootFolderId)
        return Promise.resolve([{ _id: subFolderId, name: 'SubFolder' }]);
      return Promise.resolve([]);
    }),
    getFolderWithChildrenAndFiles: jest.fn().mockImplementation((id) => {
      if (id === rootFolderId)
        return Promise.resolve({
          _id: rootFolderId,
          name: 'root',
          children: [
            { _id: subFolderId, name: 'SubFolder', children: [], files: [] },
          ],
          files: [],
        });
      if (id === subFolderId)
        return Promise.resolve({
          _id: subFolderId,
          name: 'SubFolder',
          children: [],
          files: [],
        });
      return Promise.resolve({
        _id: id,
        name: 'unknown',
        children: [],
        files: [],
      });
    }),
    findChildren: jest.fn().mockResolvedValue([]),
    deleteFolder: jest.fn().mockResolvedValue(true),
    getFullFolderPath: jest.fn().mockResolvedValue('mock/folder/path'),
  };

  const mockMaterialService = {
    create: jest.fn().mockImplementation((dto) => {
      const pack = {
        _id: new Types.ObjectId().toHexString(),
        name: dto.name,
        rootFolder: rootFolderId,
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this); // return the pack itself
        }),
      };
      return Promise.resolve(pack);
    }),
    findOne: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        _id: id,
        name: 'My Pack',
        rootFolder: rootFolderId,
      }),
    ),
    delete: jest.fn().mockImplementation((id) => {
      return Promise.resolve({
        _id: id,
        name: 'My Pack',
      });
    }),
    findByConditions: jest.fn().mockImplementation((filter) => {
      if (filter.authorId === '507f1f77bcf86cd799439011') {
        return Promise.resolve([
          {
            _id: new Types.ObjectId().toHexString(),
            name: 'My Pack',
            rootFolder: rootFolderId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            toObject: function () {
              return this;
            }, // for controller mapping
          },
        ]);
      }
      return Promise.resolve([]);
    }),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Pack.name, schema: PackSchema },
          { name: SavedItem.name, schema: SavedItemSchema },
        ]),
        FileModule,
        UsersModule,
        FolderModule,
        MaterialModule.register({ modelName: 'Pack', schema: PackSchema }),
      ],
    })
      .overrideProvider(FileService)
      .useValue(mockFileService)
      .overrideProvider(FolderService)
      .useValue(mockFolderService)
      .overrideProvider(MaterialService)
      .useValue(mockMaterialService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    packModel = moduleFixture.get<Model<Pack>>(getModelToken(Pack.name));
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await packModel.deleteMany({});
    jest.clearAllMocks();
  });

  it('should create a pack, add folders/files, download, and delete', async () => {
    // Create a pack
    const createPackRes = await request(app.getHttpServer())
      .post('/packs/create')
      .send({ name: 'My Pack', authorId: '507f1f77bcf86cd799439011' })
      .expect(201);

    const packId = createPackRes.body._id;
    const rootFolderId = createPackRes.body.rootFolder;
    expect(createPackRes.body.name).toBe('My Pack');
    expect(rootFolderId).toBeDefined();

    // Add a subfolder
    const addFolderRes = await request(app.getHttpServer())
      .post('/packs/add-folder')
      .send({ name: 'SubFolder', parent: rootFolderId })
      .expect(201);

    const subFolderId = addFolderRes.body._id;
    expect(addFolderRes.body.name).toBe('SubFolder');

    // Add a file to root
    const addRootFileRes = await request(app.getHttpServer())
      .post('/packs/add-file')
      .field('key', 'rootFile.wav')
      .field('type', 'pack')
      .attach('file', Buffer.from('root file content'), 'rootFile.wav')
      .expect(201);

    expect(addRootFileRes.body._id).toBeDefined();

    // Add a file to subfolder
    const addSubFileRes = await request(app.getHttpServer())
      .post('/packs/add-file')
      .field('key', 'subFile.wav')
      .field('type', 'pack')
      .field('parent', subFolderId)
      .attach('file', Buffer.from('sub file content'), 'subFile.wav')
      .expect(201);

    expect(addSubFileRes.body._id).toBeDefined();

    // Fetch full pack
    const getPackRes = await request(app.getHttpServer())
      .get(`/packs/user-created-packs-full/507f1f77bcf86cd799439011`)
      .expect(200);

    expect(getPackRes.body.length).toBe(1);
    expect(getPackRes.body[0].rootFolder).toBeDefined();

    // Get file URLs
    const fileUrlsRes = await request(app.getHttpServer())
      .get(`/packs/file-urls/${packId}`)
      .expect(200);

    expect(fileUrlsRes.body.files).toBeDefined();

    // Download a file
    await request(app.getHttpServer())
      .get(`/packs/download-file/${addRootFileRes.body._id}`)
      .expect(200);

    // Download a folder
    await request(app.getHttpServer())
      .get(`/packs/download-folder/${rootFolderId}`)
      .expect(200);

    const deletePackRes = await request(app.getHttpServer())
      .delete('/packs/delete-pack')
      .send({ packId })
      .expect(200);

    expect(deletePackRes.body.db._id).toBe(packId);
    expect(deletePackRes.body.bucket).toBe(true);
  });
});
