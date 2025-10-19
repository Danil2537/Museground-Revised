import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pack } from 'src/schemas/pack.schema';
import { Preset } from 'src/schemas/preset.schema';
import { Sample } from 'src/schemas/sample.schema';
import { SavedItem, SavedItemDocument } from 'src/schemas/savedItem.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class SavedItemService {
  constructor(
    @InjectModel(SavedItem.name)
    private savedItemModel: Model<SavedItemDocument>,
    @InjectModel(Pack.name) private packModel: Model<Pack>,
    @InjectModel(Sample.name) private sampleModel: Model<Sample>,
    @InjectModel(Preset.name) private presetModel: Model<Preset>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getSavedItems(userId: string, itemType: 'Pack' | 'Sample' | 'Preset') {
    console.log(
      `user id for saved items: ${userId}, and item type is: ${itemType}\n\n`,
    );
    const saved = await this.savedItemModel.find({ userId: userId, itemType });

    const ids = saved.map((s) => s.itemId);
    console.log(ids);

    if (itemType === 'Pack') {
      const found = await this.packModel.find({ _id: { $in: ids } });
      const foundWithAuthors = await Promise.all(
        found.map(async (packDoc) => {
          const pack = packDoc.toObject() as Pack;
          const author = await this.userModel.findById(pack.authorId).exec();
          return {
            ...pack,
            authorName: author ? author.username : 'Unknown',
          };
        }),
      );

      console.log('found saved packs', JSON.stringify(found));
      return foundWithAuthors;
    }
    if (itemType === 'Sample') {
      const found = await this.sampleModel.find({ _id: { $in: ids } });
      const foundWithAuthors = await Promise.all(
        found.map(async (sampleDoc) => {
          const sample = sampleDoc.toObject() as Sample;
          const author = await this.userModel.findById(sample.authorId).exec();
          return {
            ...sample,
            authorName: author ? author.username : 'Unknown',
          };
        }),
      );

      console.log('found saved packs', JSON.stringify(found));
      return foundWithAuthors;
    }
    if (itemType === 'Preset') {
      const found = await this.presetModel.find({ _id: { $in: ids } });
      const foundWithAuthors = await Promise.all(
        found.map(async (presetDoc) => {
          const preset = presetDoc.toObject() as Preset;
          const author = await this.userModel.findById(preset.authorId).exec();
          return {
            ...preset,
            authorName: author ? author.username : 'Unknown',
          };
        }),
      );

      console.log('found saved packs', JSON.stringify(found));
      return foundWithAuthors;
    }

    throw new NotFoundException('Invalid item type');
  }

  async checkIsSaved(
    userId: string,
    itemId: string,
    itemType: 'Pack' | 'Sample' | 'Preset',
  ) {
    const saved = await this.savedItemModel.find({
      userId: userId,
      itemType: itemType,
      itemId: itemId,
    });
    if (saved) return true;
    else return false;
  }
}
