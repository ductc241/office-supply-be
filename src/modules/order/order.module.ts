import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import { Order, OrderSchema } from "./order.schema";
import { CouponModule } from "../coupon/coupon.module";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { OrderController } from "./order.controller";
import { CouponUsageModule } from "../coupon-usage/coupon-usage.module";

@Module({
  providers: [OrderRepository, OrderService],
  controllers: [OrderController],
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CouponModule,
    CouponUsageModule,
    ProductVariantModule,
  ],
})
export class OrderModule {}
