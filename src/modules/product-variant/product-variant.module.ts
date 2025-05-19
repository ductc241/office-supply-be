import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductVariant, ProductVariantSchema } from "./product-variant.schema";

@Module({
  // providers: [ProductVariantService],
  // controllers: [ProductVariantController],
  imports: [
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
})
export class ProductVariantModule {}
