import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MATERIAL_OPTIONS } from './constants';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MaterialModuleOptions } from './interfaces';
import { PresetController } from './controllers/preset.controller';
import { SampleController } from './controllers/sample.controller';
import { PackController } from './controllers/pack.controller';
import { FileModule } from 'src/files/file.module';
import { FolderModule } from 'src/folder/folder.module';
import { Document, Model, Schema } from 'mongoose';
import { UsersModule } from 'src/users/users.module';

@Module({})
export class MaterialModule {
  static register<T extends Document>(
    options: MaterialModuleOptions,
  ): DynamicModule {
    const controllerMap: Record<string, Type<any>> = {
      Sample: SampleController,
      Preset: PresetController,
      Pack: PackController,
    };

    const modelToken = getModelToken(options.modelName);

    const materialProvider: Provider = {
      provide: MaterialService,
      useFactory: (model: Model<T>) => new MaterialService<T>(options, model),
      inject: [modelToken],
    };

    return {
      module: MaterialModule,
      imports: [
        MongooseModule.forFeature([
          { name: options.modelName, schema: options.schema as Schema },
        ]),
        FileModule,
        FolderModule,
        UsersModule,
      ],
      providers: [
        { provide: MATERIAL_OPTIONS, useValue: options },
        materialProvider,
      ],
      controllers: [controllerMap[options.modelName]],
      exports: [MaterialService],
    };
  }
}
