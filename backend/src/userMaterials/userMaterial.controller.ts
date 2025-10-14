import {
  Controller,
} from '@nestjs/common';
import { UserMaterialService } from './userMaterial.service';

@Controller('user-material')
export class UserMaterialController {
  constructor(private readonly bucket: UserMaterialService) {}

}
