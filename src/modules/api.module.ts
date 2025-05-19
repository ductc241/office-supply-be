import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";
import { BrandModule } from "./brand/brand.module";
import { CategoryModule } from "./category/category.module";
import { ProductVariantModule } from "./product-variant/product-variant.module";
import { UserModule } from "./user/user.module";
import { CartItemModule } from "./cart-item/cart-item.module";
import { CartModule } from "./cart/cart.module";

@Module({
  imports: [
    BrandModule,
    CategoryModule,
    ProductModule,
    ProductVariantModule,
    UserModule,
    CartItemModule,
    CartModule,
  ],
})
export class ApiModule {}
