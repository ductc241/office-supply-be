import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ProductService } from "./product.services";
import { CreateFullProductDto } from "./dto/create-product.dto";
import { QueryProductsDto } from "./dto/query-product";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { Pagination } from "src/shared/pagination/pagination.decorator";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateFullProductDto) {
    return await this.productService.create(dto);
  }

  @Get("query")
  @ApiPagination()
  async query(
    @Query() dto: QueryProductsDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.productService.query(dto, pagination);
  }
}
