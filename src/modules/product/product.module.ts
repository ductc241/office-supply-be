import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductService } from "./product.services";
import { ProductController } from "./product.controller";
import { Product, ProductSchema } from "./product.schema";
import { ProductRepository } from "./product.repository";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { CategoryModule } from "../category/category.module";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { StockTransactionModule } from "../stock-transaction/stock-transaction.module";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  providers: [ProductService, ProductRepository, PaginationHeaderHelper],
  controllers: [ProductController],
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductVariantModule,
    CategoryModule,
    StockTransactionModule,
    InventoryModule,
  ],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
