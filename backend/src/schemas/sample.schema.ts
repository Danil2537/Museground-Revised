import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Sample {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop()
  @IsString()
  fileUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;


  @Prop()
  @IsNumber()
  @IsOptional()
  BPM?: number;

  @Prop()
  @IsOptional()
  @IsString()
  instruments?: string;

  @Prop()
  @IsOptional()
  @IsString()
  genres?: string;

  @Prop()
  @IsOptional()
  @IsString()
  @MaxLength(4) //like C#m or G♭
  key?: string;
}
export type SampleDocument = Sample & Document;
export const SampleSchema = SchemaFactory.createForClass(Sample);
