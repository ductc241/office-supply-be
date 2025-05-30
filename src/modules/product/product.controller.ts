import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { ProductService } from "./product.services";
import { Pagination } from "src/shared/pagination/pagination.decorator";

import { CreateFullProductDto } from "./dto/create-product.dto";
import { QueryProductsDto } from "./dto/query-product";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
@ApiBearerAuth()
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateFullProductDto) {
    return await this.productService.create(dto);
  }

  @ApiPagination()
  @Get("query")
  async query(
    @Query() dto: QueryProductsDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.productService.query(dto, pagination);
  }

  @Get("available-product-variant/:id")
  async getAvailableProductAttributes(@Query("id") id: string) {
    return await this.productService.getAvailableProductAttributes(id);
  }
}
