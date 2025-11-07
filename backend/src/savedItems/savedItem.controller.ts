import { Controller, Get, Param } from '@nestjs/common';
import { SavedItemService } from './savedItem.service';

@Controller('saved-items')
export class SavedItemController {
  constructor(private readonly savedItemService: SavedItemService) {}

  @Get('get-saved/:userId/:type')
  async getUserSavedItems(
    @Param('userId') userId: string,
    @Param('type') type: 'Pack' | 'Sample' | 'Preset',
  ) {
    //console.log(`saved item controller user id: ${userId}`);
    return await this.savedItemService.getSavedItems(userId, type);
  }

  @Get('check-saved/:userId/:type/:itemId')
  async checkIfItemIsSaved(
    @Param('userId') userId: string,
    @Param('type') type: 'Pack' | 'Sample' | 'Preset',
    @Param('itemId') itemId: string,
  ) {
    return await this.savedItemService.checkIsSaved(userId, itemId, type);
  }
}
