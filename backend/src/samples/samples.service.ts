import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sample } from 'src/schemas/sample.schema';
import { SampleDocument } from 'src/schemas/sample.schema';
import { CreateSampleDTO } from './DTO/createSample.dto';

@Injectable()
export class SamplesService {
  constructor(
    @InjectModel(Sample.name) private sampleModel: Model<SampleDocument>,
  ) {}

  createSample(createSampleDTO: CreateSampleDTO): Promise<SampleDocument> {
    console.log('creating a new sample\n');
    const newSample = new this.sampleModel({ ...createSampleDTO });
    return newSample.save();
  }
}
