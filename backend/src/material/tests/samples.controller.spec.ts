import { Test, TestingModule } from '@nestjs/testing';
import { SampleController } from '../controllers/sample.controller';
import { MaterialService } from '../material.service';

describe('SampleController', () => {
  let sampleController: SampleController;
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
      controllers: [SampleController],
      providers: [
        {
          provide: MaterialService,
          useValue: mockMaterialService,
        },
      ],
    }).compile();

    materialService = moduleRef.get(MaterialService);
    sampleController = moduleRef.get(SampleController);
  });

  describe('findAll', () => {
    it('should return an array of samples', async () => {
      const result = [{ name: 'testSample' }];

      (materialService.findAll as jest.Mock).mockResolvedValue(result);

      const response = await sampleController.findAll({});

      expect(response).toEqual(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('create', () => {
    it('should call MaterialService.create with DTO', async () => {
      const dto = { name: 'newSample' };
      const saved = { _id: '123', ...dto };

      (materialService.create as jest.Mock).mockResolvedValue(saved);

      const response = await sampleController.create(dto);

      expect(response).toEqual(saved);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call MaterialService.findOne with id', async () => {
      const sample = { _id: 'abc123', name: 'sample' };

      (materialService.findOne as jest.Mock).mockResolvedValue(sample);

      const response = await sampleController.findOne('abc123');

      expect(response).toEqual(sample);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findOne).toHaveBeenCalledWith('abc123');
    });
  });
});
