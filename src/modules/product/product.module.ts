import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductService } from "./product.services";
import { ProductController } from "./product.controller";
import { Product, ProductSchema } from "./product.schema";
import { ProductRepository } from "./product.repository";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { CategoryModule } from "../category/category.module";

@Module({
  providers: [ProductService, ProductRepository],
  controllers: [ProductController],
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductVariantModule,
    CategoryModule,
  ],
})
export class ProductModule {}
