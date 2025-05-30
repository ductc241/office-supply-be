import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductVariant, ProductVariantSchema } from "./product-variant.schema";
import { ProductVariantRepository } from "./product-variant.repository";

@Module({
  providers: [ProductVariantRepository],
  // controllers: [ProductVariantController],
  exports: [ProductVariantRepository],
  imports: [
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
})
export class ProductVariantModule {}
