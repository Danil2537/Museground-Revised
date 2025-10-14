import { Module } from '@nestjs/common';
import { UserMaterialService } from './userMaterial.service';
import { UserMaterialController } from './userMaterial.controller';

@Module({
  imports: [],
  providers: [UserMaterialService],
  controllers: [UserMaterialController],
  exports: [UserMaterialService],
})
export class UserMaterialModule {}
