import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
@Schema()
export class Folder {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', required: false })
  @IsOptional()
  parent?: Types.ObjectId; // recursive relationship

  @Prop({ type: [{ type: Types.ObjectId, ref: 'File' }], default: [] })
  @IsOptional()
  @IsArray()
  files: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Folder' }], default: [] })
  @IsOptional()
  @IsArray()
  subfolders: Types.ObjectId[];
}
export type FolderDocument = Folder & Document;
export const FolderSchema = SchemaFactory.createForClass(Folder);
