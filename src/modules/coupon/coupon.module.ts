import { Module } from "@nestjs/common";

import { CouponRepository } from "./coupon.repository";
import { ProductModule } from "../product/product.module";
import { CouponService } from "./coupon.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Coupon, CouponSchema } from "./coupon.schema";

@Module({
  providers: [CouponRepository, CouponService],
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
    ProductModule,
  ],
  exports: [CouponRepository, CouponService],
})
export class CouponModule {}
