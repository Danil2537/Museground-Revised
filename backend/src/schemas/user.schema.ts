import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  @IsString()
  username: string;

  @Prop()
  @IsString()
  @IsEmail()
  email: string;

  @Prop()
  @IsOptional()
  password?: string;

  @Prop({ default: 'local' })
  provider: 'local' | 'google';

  @Prop({ default: 0 })
  @IsNumber()
  totalDownloads: number;

  @Prop({ default: 0 })
  @IsNumber()
  totalUploads: number;
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
