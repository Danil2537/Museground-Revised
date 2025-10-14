import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class SavedItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['Sample', 'Preset', 'Pack'],
  })
  itemType: 'Sample' | 'Preset' | 'Pack';

  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'itemType',
  })
  itemId: Types.ObjectId;

  @Prop({ default: Date.now })
  savedAt: Date;
}

export type SavedItemDocument = SavedItem & Document;
export const SavedItemSchema = SchemaFactory.createForClass(SavedItem);
