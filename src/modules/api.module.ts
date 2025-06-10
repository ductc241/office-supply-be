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
import { WarehouseModule } from "./warehouse/warehouse.module";
import { StockTransactionModule } from "./stock-transaction/stock-transaction.module";

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
    WarehouseModule,
    StockTransactionModule,
  ],
})
export class ApiModule {}
