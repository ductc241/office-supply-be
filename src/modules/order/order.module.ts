import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import { Order, OrderSchema } from "./order.schema";
import { CouponModule } from "../coupon/coupon.module";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { OrderController } from "./order.controller";
import { CouponUsageModule } from "../coupon-usage/coupon-usage.module";
import { InventoryModule } from "../inventory/inventory.module";
import { StockTransactionModule } from "../stock-transaction/stock-transaction.module";
import { MailModule } from "../mail/mail.module";
import { SocketModule } from "../socket/socket.module";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { UserModule } from "../user/user.module";

@Module({
  providers: [OrderRepository, OrderService, PaginationHeaderHelper],
  controllers: [OrderController],
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CouponModule,
    CouponUsageModule,
    ProductVariantModule,
    UserModule,
    InventoryModule,
    StockTransactionModule,
    MailModule,
    SocketModule,
  ],
  exports: [OrderRepository],
})
export class OrderModule {}
