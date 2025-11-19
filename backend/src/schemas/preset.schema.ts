import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Preset {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop()
  fileUrl: string;

  @Prop()
  soundFileUrl: string;

  @Prop()
  vst?: string;

  @Prop()
  genres?: string;

  @Prop()
  types?: string;

  @Prop({ type: Types.ObjectId, ref: 'File' })
  fileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'File' })
  soundFileId: Types.ObjectId;
}
export type PresetDocument = Preset & Document;
export const PresetSchema = SchemaFactory.createForClass(Preset);
