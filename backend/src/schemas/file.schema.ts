import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop()
  @IsNumber()
  size: number; //probably in megs

  @Prop({ required: true })
  @IsString()
  @IsUrl()
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', required: false })
  @IsOptional()
  parent?: Types.ObjectId;
}
export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
