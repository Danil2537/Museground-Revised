import { Module } from "@nestjs/common";
import { BucketService } from "./bucket.service";
import { BucketController } from "./bucket.controller";

@Module({
  imports: [],
  providers: [BucketService],
  controllers: [BucketController],
  exports: [BucketService],
})
export class BucketModule {}