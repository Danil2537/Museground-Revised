import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Pack {
  @Prop({ required: true })
  name: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder' })
  rootFolder: Types.ObjectId;
}
export type PackDocument = Pack & Document;
export const PackSchema = SchemaFactory.createForClass(Pack);
