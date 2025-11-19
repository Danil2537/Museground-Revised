/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { Preset, PresetSchema } from '../schemas/preset.schema';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';
import { FileModule } from '../files/file.module';
import { UsersModule } from '../users/users.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import { ConfigModule } from '@nestjs/config';
import { FileService } from '../files/file.service';

describe('PresetController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let presetModel: Model<Preset>;

  const mockFileService = {
    uploadFile: jest
      .fn()
      .mockImplementation((file) =>
        Promise.resolve({ _id: 'fileid', url: `mock://files/${file.key}` }),
      ),
    deleteFile: jest.fn().mockResolvedValue(true),
    getFileById: jest
      .fn()
      .mockResolvedValue({ _id: 'fileid', url: 'mock://files/file' }),
    downloadFile: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Preset.name, schema: PresetSchema },
          { name: SavedItem.name, schema: SavedItemSchema },
        ]),
        FileModule,
        UsersModule,
        MaterialModule.register({ modelName: 'Preset', schema: PresetSchema }),
      ],
    })
      .overrideProvider(FileService)
      .useValue(mockFileService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    presetModel = moduleFixture.get<Model<Preset>>(getModelToken(Preset.name));
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await presetModel.deleteMany({});
    jest.clearAllMocks();
  });

  it('should create, get, update, replace files, and delete a preset', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/presets/upload')
      .field('name', 'Test Preset')
      .field('authorId', '507f1f77bcf86cd799439011')
      .attach('presetFile', Buffer.from('preset data'), 'preset.fxp')
      .attach('soundFile', Buffer.from('sound data'), 'sound.wav')
      .expect(201);

    const presetId: string = createRes.body._id as string;
    expect(createRes.body.name).toBe('Test Preset');
    expect(createRes.body.fileUrl).toBeDefined();
    expect(createRes.body.soundFileUrl).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/presets/get/${presetId}`)
      .expect(200);

    expect(getRes.body._id).toBe(presetId);
    expect(getRes.body.name).toBe('Test Preset');

    const updateRes = await request(app.getHttpServer())
      .patch(`/presets/update/${presetId}`)
      .send({ name: 'Updated Preset', genres: 'EDM' })
      .expect(200);

    expect(updateRes.body.name).toBe('Updated Preset');
    expect(updateRes.body.genres).toBe('EDM');

    const replacePresetRes = await request(app.getHttpServer())
      .post('/presets/replace-preset-file')
      .field('presetId', presetId)
      .field('fileType', 'presetFile')
      .attach('file', Buffer.from('new preset data'), 'new_preset.fxp')
      .expect(201);

    expect(replacePresetRes.body.message).toBe('File replaced successfully');
    expect(replacePresetRes.body.preset.fileUrl).toBeDefined();

    const replaceSoundRes = await request(app.getHttpServer())
      .post('/presets/replace-preset-file')
      .field('presetId', presetId)
      .field('fileType', 'soundFile')
      .attach('file', Buffer.from('new sound data'), 'new_sound.wav')
      .expect(201);

    expect(replaceSoundRes.body.message).toBe('File replaced successfully');
    expect(replaceSoundRes.body.preset.soundFileUrl).toBeDefined();

    // Delete the preset
    const deleteRes = await request(app.getHttpServer())
      .delete(`/presets/delete/${presetId}`)
      .expect(200);

    expect(deleteRes.body.db._id).toBe(presetId);
    expect(deleteRes.body.r2).toBeDefined();
  });
});
