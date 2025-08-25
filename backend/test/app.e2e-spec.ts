import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { SuperTest, Test as SupertestTest } from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let api: SuperTest<SupertestTest>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    api = request(app.getHttpServer()) as unknown as SuperTest<SupertestTest>;
  });

  it('/ (GET)', async () => {
    await api.get('/').expect(200).expect('Hello World!');
  });
});
