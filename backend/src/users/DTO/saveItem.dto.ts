import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SaveItemDTO {
  constructor() {}

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['Sample', 'Preset', 'Pack'])
  itemType: 'Sample' | 'Preset' | 'Pack';

  @IsString()
  @IsNotEmpty()
  itemId?: string;
}
