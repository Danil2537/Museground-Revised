import { Model, Document } from 'mongoose';

export class MaterialService<T extends Document> {
  constructor(private model: Model<T>) {}

  async createMaterial(createDto: any): Promise<T> {
    const doc = new this.model(createDto);
    return doc.save();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, updateDto: any): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
