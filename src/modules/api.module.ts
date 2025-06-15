import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";
import { BrandModule } from "./brand/brand.module";
import { CategoryModule } from "./category/category.module";
import { ProductVariantModule } from "./product-variant/product-variant.module";
import { UserModule } from "./user/user.module";
import { CartModule } from "./cart/cart.module";
import { AuthModule } from "./auth/auth.module";
import { CouponModule } from "./coupon/coupon.module";
import { OrderModule } from "./order/order.module";
import { UserAddressModule } from "./user-address/user-address.module";
import { InventoryModule } from "./inventory/inventory.module";
import { StockTransactionModule } from "./stock-transaction/stock-transaction.module";
import { StockModule } from "./stock/stock.module";
import { MailModule } from "./mail/mail.module";
import { CronModule } from "./cron-job/cron.module";
import { StatisticalModule } from "./statistical/statistical.module";

@Module({
  imports: [
    AuthModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    ProductVariantModule,
    UserModule,
    UserAddressModule,
    CartModule,
    CouponModule,
    OrderModule,
    InventoryModule,
    StockTransactionModule,
    StockModule,
    MailModule,
    StatisticalModule,
    CronModule,
  ],
})
export class ApiModule {}
