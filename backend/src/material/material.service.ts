import { Injectable } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class MaterialService {
  constructor(
    private options: any,
    private model: Model<Document>, // model is passed from factory
  ) {}

  async create(createDto: Record<string, any>) {
    const doc = new this.model(createDto);
    return doc.save();
  }

  async findAll(filter: FilterQuery<Document> = {}) {
    return this.model.find(filter).exec();
  }

  async findOne(id: string) {
    return this.model.findById(id).exec();
  }

  async update(id: string, updateDto: Record<string, any>) {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findByConditions(conditions: FilterQuery<Document>) {
    return this.model.find(conditions).exec();
  }
}
