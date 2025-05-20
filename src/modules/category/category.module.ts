import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./category.schema";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { CategoryRepository } from "./category.repository";

@Module({
  providers: [CategoryService, CategoryRepository, PaginationHeaderHelper],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
