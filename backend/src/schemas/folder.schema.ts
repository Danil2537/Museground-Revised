import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
@Schema()
export class Folder {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', required: false })
  @IsOptional()
  parent?: Types.ObjectId; // recursive relationship
}
export type FolderDocument = Folder & Document;
export const FolderSchema = SchemaFactory.createForClass(Folder);
