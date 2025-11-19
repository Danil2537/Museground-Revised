import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', required: false })
  @IsOptional()
  parent?: Types.ObjectId;
}
export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
