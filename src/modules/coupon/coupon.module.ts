import { Module } from "@nestjs/common";

import { CouponRepository } from "./coupon.repository";
import { ProductModule } from "../product/product.module";
import { CouponService } from "./coupon.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Coupon, CouponSchema } from "./coupon.schema";
import { CouponUsageModule } from "../coupon-usage/coupon-usage.module";
import { CouponController } from "./coupon.controller";
import { CartModule } from "../cart/cart.module";

@Module({
  providers: [CouponRepository, CouponService],
  controllers: [CouponController],
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
    ProductModule,
    CouponUsageModule,
    CartModule,
  ],
  exports: [CouponRepository, CouponService],
})
export class CouponModule {}
