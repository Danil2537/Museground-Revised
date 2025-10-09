import { DynamicModule, Provider } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { Model, Document } from 'mongoose';

export interface MaterialModuleOptions<T extends Document> {
  prefix: string; // route prefix
  model: Model<T>; // Mongoose model
}

export function MaterialModule<T extends Document>(
  options: MaterialModuleOptions<T>,
): DynamicModule {
  // Provider for MaterialService
  const serviceProvider: Provider = {
    provide: MaterialService,
    useFactory: () => new MaterialService(options.model),
  };

  // Generate controller class
  const ControllerClass = MaterialController<T>(options.prefix);

  return {
    module: class {},
    providers: [serviceProvider],
    exports: [serviceProvider],
    controllers: [ControllerClass],
    global: true,
  };
}
