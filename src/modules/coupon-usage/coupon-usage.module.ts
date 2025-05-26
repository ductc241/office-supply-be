import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { CouponUsage, CouponUsageSchema } from "./coupon-usage.schema";
import { CouponUsageRepository } from "./coupon-usage.repository";
import { CouponUsageService } from "./coupon-usage.service";

@Module({
  providers: [CouponUsageRepository, CouponUsageService],
  imports: [
    MongooseModule.forFeature([
      { name: CouponUsage.name, schema: CouponUsageSchema },
    ]),
  ],
  exports: [CouponUsageService],
})
export class CouponUsageModule {}
