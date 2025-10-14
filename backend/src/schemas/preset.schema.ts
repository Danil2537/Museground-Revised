import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema()
export class Preset {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop()
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @Prop({ required: true })
  @IsString()
  author: string;

  @Prop({ required: true })
  @IsString()
  @IsUrl()
  fileUrl: string;

  @Prop()
  @IsOptional()
  @IsString()
  vst?: string;

  @Prop()
  @IsOptional()
  @IsString()
  genres?: string;

  @Prop()
  @IsOptional()
  @IsString()
  types?: string;

  @Prop({ type: Types.ObjectId, ref: 'File' })
  fileId: Types.ObjectId;
}
export type PresetDocument = Preset & Document;
export const PresetSchema = SchemaFactory.createForClass(Preset);
