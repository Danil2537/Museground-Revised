import { Test, TestingModule } from '@nestjs/testing';
import { PresetController } from '../controllers/preset.controller';
import { MaterialService } from '../material.service';

describe('PresetController', () => {
  let presetController: PresetController;
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
      controllers: [PresetController],
      providers: [
        {
          provide: MaterialService,
          useValue: mockMaterialService,
        },
      ],
    }).compile();

    materialService = moduleRef.get(MaterialService);
    presetController = moduleRef.get(PresetController);
  });

  describe('findAll', () => {
    it('should return an array of presets', async () => {
      const result = [{ name: 'testPreset' }];

      (materialService.findAll as jest.Mock).mockResolvedValue(result);

      const response = await presetController.findAll({});

      expect(response).toEqual(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('create', () => {
    it('should call MaterialService.create with DTO', async () => {
      const dto = { name: 'newPreset' };
      const saved = { _id: '123', ...dto };

      (materialService.create as jest.Mock).mockResolvedValue(saved);

      const response = await presetController.create(dto);

      expect(response).toEqual(saved);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call MaterialService.findOne with id', async () => {
      const preset = { _id: 'abc123', name: 'preset' };

      (materialService.findOne as jest.Mock).mockResolvedValue(preset);

      const response = await presetController.findOne('abc123');

      expect(response).toEqual(preset);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(materialService.findOne).toHaveBeenCalledWith('abc123');
    });
  });
});
