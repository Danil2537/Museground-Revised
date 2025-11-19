// Source - https://stackoverflow.com/questions/76222539/how-to-setup-mongodb-memory-server-in-nestjs-for-e2e-testing
// Posted by Ussama Zubair
// Retrieved 2025-11-19, License - CC BY-SA 4.0

import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule, ConfigService } from '@nestjs/config';

let mongod: MongoMemoryServer;

export const TestDbModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFactory: async (configService: ConfigService) => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    return {
      uri: mongoUri,
    };
  },
  inject: [ConfigService],
});

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};
