import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema()
export class Pack {
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

  @Prop({ type: Types.ObjectId, ref: 'Folder', required: true })
  rootFolder: Types.ObjectId;
}
export type PackDocument = Pack & Document;
export const PackSchema = SchemaFactory.createForClass(Pack);
