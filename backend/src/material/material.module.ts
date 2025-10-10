import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MATERIAL_OPTIONS } from './constants';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MaterialModuleOptions } from './interfaces';
import { PresetController } from './controllers/preset.controller';
import { SampleController } from './controllers/samples.controller';
import { PackController } from './controllers/pack.controller';

@Module({})
export class MaterialModule {
  static register(options: MaterialModuleOptions): DynamicModule {
    const controllerMap = {
      Sample: SampleController,
      Preset: PresetController,
      Pack: PackController,
    };

    const materialProvider: Provider = {
      provide: MaterialService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      useFactory: (model: any) => new MaterialService(options, model),
      inject: [getModelToken(options.modelName)],
    };
    return {
      module: MaterialModule,
      imports: [
        MongooseModule.forFeature([
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { name: options.modelName, schema: options.schema },
        ]),
      ],
      providers: [
        { provide: MATERIAL_OPTIONS, useValue: options },
        materialProvider,
      ],
      //controllers: options.modelName === 'Preset' ? [PresetController] : [],
      controllers: [controllerMap[options.modelName]],
      exports: [MaterialService],
    };
  }
}
