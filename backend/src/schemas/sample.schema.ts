import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Sample {
  @Prop({ required: true })
  name: string;

  @Prop()
  fileUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop()
  BPM?: number;

  @Prop()
  instruments?: string;

  @Prop()
  genres?: string;

  @Prop()
  key?: string;

  @Prop({ type: Types.ObjectId, ref: 'File' })
  fileId: Types.ObjectId;
}
export type SampleDocument = Sample & Document;
export const SampleSchema = SchemaFactory.createForClass(Sample);
