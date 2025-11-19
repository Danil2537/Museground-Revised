import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { SavedItem, SavedItemSchema } from '../schemas/savedItem.schema';
import { CreateUserDTO } from '../users/DTO/createUser.dto';
import { SaveItemDTO } from '../users/DTO/saveItem.dto';
import mongoose from 'mongoose';

import { TestDbModule, closeInMongodConnection } from './test-db.module';

describe('UsersService', () => {
  let module: TestingModule;
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestDbModule, // ▶️ replaces MongoMemoryServer manual setup
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: SavedItem.name, schema: SavedItemSchema },
        ]),
      ],
      providers: [UsersService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await closeInMongodConnection(); // ▶️ graceful shutdown
    await module.close();
  });

  it('should create a new user', async () => {
    const dto: CreateUserDTO = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      provider: 'local',
    };

    const user = await usersService.createUser(dto);

    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
    expect(user.password).not.toBe('password123'); // should be hashed
  });

  it('should find the created user by name', async () => {
    const user = await usersService.findByName('testuser');

    expect(user).toBeDefined();
    expect(user?.username).toBe('testuser');
  });

  it('should save an item and increment totalDownloads', async () => {
    const user = await usersService.findByName('testuser');

    expect(user).toBeDefined();

    const saveDto: SaveItemDTO = {
      userId: user!._id as string,
      itemType: 'Sample',
      itemId: '68f6c696a266d1bd097d6286',
    };

    const updatedUser = await usersService.saveItem(saveDto);

    expect(updatedUser).toBeDefined();
    expect(updatedUser.totalDownloads).toBe(1);
  });

  it('should fetch saved items for the user', async () => {
    const user = await usersService.findByName('testuser');

    const items = await usersService.getSavedItems(
      user!._id as string,
      'Sample',
    );

    expect(items).toHaveLength(1);
    expect(items[0].itemId).toBe('68f6c696a266d1bd097d6286');
  });

  it('should delete a saved item', async () => {
    const user = await usersService.findByName('testuser');

    const dto: SaveItemDTO = {
      userId: user!._id as string,
      itemType: 'Sample',
      itemId: '68f6c696a266d1bd097d6286',
    };

    const res = await usersService.deleteSavedItem(dto);

    expect(res).toBeDefined();
    expect(res.deletedCount).toBe(1);

    // verify deletion
    const items = await usersService.getSavedItems(
      user!._id as string,
      'Sample',
    );

    expect(items).toHaveLength(0);
  });
});
