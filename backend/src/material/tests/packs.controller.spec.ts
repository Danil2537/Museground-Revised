import { Test, TestingModule } from '@nestjs/testing';
import { PackController } from '../controllers/pack.controller';
import { MaterialService } from '../material.service';

describe('PackController', () => {
  let packController: PackController;
  let materialService: jest.Mocked<MaterialService>; // <-- strongly typed mock

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockMaterialService: jest.Mocked<MaterialService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByConditions: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PackController],
      providers: [
        {
          provide: MaterialService,
          useValue: mockMaterialService,
        },
      ],
    }).compile();

    materialService = moduleRef.get(MaterialService);
    packController = moduleRef.get(PackController);
  });

  describe('findAll', () => {
    it('should return an array of packs', async () => {
      const result = [{ name: 'testPack' }];

      (materialService.findAll as jest.Mock).mockResolvedValue(result);

      const response = await packController.findAll({});

      expect(response).toEqual(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('create', () => {
    it('should call MaterialService.create with DTO', async () => {
      const dto = { name: 'newPack' };
      const saved = { _id: '123', ...dto };

      (materialService.create as jest.Mock).mockResolvedValue(saved);

      const response = await packController.create(dto);

      expect(response).toEqual(saved);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call MaterialService.findOne with id', async () => {
      const pack = { _id: 'abc123', name: 'pack' };

      (materialService.findOne as jest.Mock).mockResolvedValue(pack);

      const response = await packController.findOne('abc123');

      expect(response).toEqual(pack);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findOne).toHaveBeenCalledWith('abc123');
    });
  });
});
