import { Module } from '@nestjs/common';
import {
  Sample,
  SampleDocument,
  SampleSchema,
} from 'src/schemas/sample.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialModule } from 'src/material/material.module';
import { Model } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sample.name, schema: SampleSchema }]),
    MaterialModule<SampleDocument>({
      prefix: 'samples',
      model: Sample as unknown as Model<SampleDocument>,
    }),
  ],
})
export class SamplesModule {}
