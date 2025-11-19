/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { Sample, SampleSchema } from '../schemas/sample.schema';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';
import { FileModule } from '../files/file.module';
import { UsersModule } from '../users/users.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import { ConfigModule } from '@nestjs/config';

describe('SampleController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let sampleModel: Model<Sample>;
  

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
  
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }), 
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Sample.name, schema: SampleSchema },
          { name: SavedItem.name, schema: SavedItemSchema },
        ]),
        FileModule,
        UsersModule,
        MaterialModule.register({ modelName: 'Sample', schema: SampleSchema }),
      ],
    }).compile();
  
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  
    sampleModel = moduleFixture.get<Model<Sample>>(getModelToken(Sample.name));
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await sampleModel.deleteMany({});
  });

  it('should create, get, update, replace file and delete a sample', async () => {
    // Create a sample
    const createRes = await request(app.getHttpServer())
      .post('/samples/upload')
      .field('name', 'Test Sample')
      .field('authorId', '507f1f77bcf86cd799439011') // fake ObjectId
      .attach('file', Buffer.from('fake audio data'), 'sample.mp3')
      .expect(201);

    const sampleId:string = createRes.body._id as string;
    expect(createRes.body.name).toBe('Test Sample');
    expect(createRes.body.fileUrl).toBeDefined();
    expect(createRes.body.fileId).toBeDefined();

    // Get the sample
    const getRes = await request(app.getHttpServer())
      .get(`/samples/get/${sampleId}`)
      .expect(200);

    expect(getRes.body._id).toBe(sampleId);
    expect(getRes.body.name).toBe('Test Sample');

    // Update the sample
    const updateRes = await request(app.getHttpServer())
      .patch(`/samples/update/${sampleId}`)
      .send({ name: 'Updated Sample', BPM: 128 })
      .expect(200);

    expect(updateRes.body.name).toBe('Updated Sample');
    expect(updateRes.body.BPM).toBe(128);

    // Replace the file
    const replaceRes = await request(app.getHttpServer())
      .post('/samples/replace-file')
      .field('sampleId', sampleId)
      .attach('file', Buffer.from('new fake data'), 'new_sample.mp3')
      .expect(201);

    expect(replaceRes.body.message).toBe('File replaced successfully');
    expect(replaceRes.body.sample.fileUrl).toBeDefined();

    // Delete the sample
    const deleteRes = await request(app.getHttpServer())
      .delete(`/samples/delete/${sampleId}`)
      .expect(200);

    expect(deleteRes.body.db._id).toBe(sampleId);
    expect(deleteRes.body.r2).toBeDefined();
  });
});
