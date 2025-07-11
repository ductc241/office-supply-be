import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./category.schema";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CategoryRepository } from "./category.repository";
import { BrandModule } from "../brand/brand.module";
import { ProductModule } from "../product/product.module";

@Module({
  providers: [CategoryService, CategoryRepository],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    BrandModule,
    forwardRef(() => ProductModule),
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
