import { Injectable } from '@nestjs/common';
import { FilterQuery, Model, Document } from 'mongoose';

@Injectable()
export class MaterialService<T extends Document> {
  constructor(
    private options: any,
    private model: Model<T>,
  ) {
    console.log(`Creating MaterialService with model:`, model.modelName);
  }

  async create(createDto: Record<string, any>): Promise<T> {
    console.log('creating mongoose model in material service\n');
    const doc = new this.model(createDto);
    return await doc.save();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findOne(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, updateDto: Record<string, any>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findByConditions(conditions: FilterQuery<T>): Promise<T[]> {
    return this.model.find(conditions).exec();
  }
}
