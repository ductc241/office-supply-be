import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Brand, BrandSchema } from "./brand.schema";
import { BrandRepository } from "./brand.repository";
import { BrandController } from "./brand.controller";
import { BrandService } from "./brand.service";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";

@Module({
  providers: [BrandRepository, BrandService, PaginationHeaderHelper],
  exports: [BrandService],
  controllers: [BrandController],
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
})
export class BrandModule {}
