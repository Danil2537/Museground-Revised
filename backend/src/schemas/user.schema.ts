import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop()
  email: string;

  @Prop()
  password?: string;

  @Prop({ default: 'local' })
  provider: 'local' | 'google';

  @Prop({ default: 0 })
  totalDownloads: number;

  @Prop({ default: 0 })
  totalUploads: number;
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
