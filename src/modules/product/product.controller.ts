import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { ProductService } from "./product.services";

import { CreateFullProductDto } from "./dto/create-product.dto";
import { QueryProductsDto } from "./dto/query-product";
import { QueryProductOptionDto } from "./dto/query-option.dto";

@ApiBearerAuth()
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateFullProductDto) {
    return await this.productService.create(dto);
  }

  // @ApiPagination()
  // @Get("query")
  @Post("query")
  async query(
    // @Query() dto: QueryProductsDto,
    @Body() dto: QueryProductsDto,
    // @Pagination() pagination: IPagination,
  ) {
    // return await this.productService.query(dto, pagination);
    return await this.productService.query(dto);
  }

  @Get("query-option")
  async queryOption(@Query() query: QueryProductOptionDto) {
    return await this.productService.queryOption(query.name);
  }

  @ApiOperation({
    summary:
      "web - get product detail with available variants - work with category level 2",
  })
  @Get("get-detail/:productId")
  async getDetail(@Param("productId") productId: string) {
    return await this.productService.getDetail(productId);
  }

  @ApiOperation({
    summary: "web - get specification values for filter products",
  })
  @Get("get-specifications/:categoryId")
  async getAvailableProductAttributes(@Param("categoryId") id: string) {
    return await this.productService.getUniqueSpecValuesByCategory(id);
  }

  // @Get("available-product-variant/:id")
  // async getAvailableProductAttributes(@Query("id") id: string) {
  //   return await this.productService.getAvailableProductAttributes(id);
  // }
}
