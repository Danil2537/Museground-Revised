import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MATERIAL_OPTIONS } from './constants';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MaterialModuleOptions } from './interfaces';
import { PresetController } from './material.controller';

@Module({})
export class MaterialModule {
  static register(options: MaterialModuleOptions): DynamicModule {
     const materialProvider: Provider = {
      provide: MaterialService,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      useFactory: (model: any) => new MaterialService(options, model),
      inject: [getModelToken(options.modelName)],
    };
    return {
      module: MaterialModule,
      imports: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        MongooseModule.forFeature([{ name: options.modelName, schema: options.schema }]),
      ],
      providers: [
        { provide: MATERIAL_OPTIONS, useValue: options },
        materialProvider,
      ],
      controllers: options.modelName === 'Preset' ? [PresetController] : [],
      exports: [MaterialService],
    };
  }
}
