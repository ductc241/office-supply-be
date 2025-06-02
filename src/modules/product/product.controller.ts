import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { ProductService } from "./product.services";

import { CreateFullProductDto } from "./dto/create-product.dto";
import { QueryProductsDto } from "./dto/query-product";

@ApiBearerAuth()
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateFullProductDto) {
    return await this.productService.create(dto);
  }

  @ApiOperation({
    summary: "web - query list product",
  })
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

  @ApiOperation({
    summary: "web - get product detail with all variants",
  })
  @Get("get-detail/:productId")
  async getDetail(@Param("productId") productId: string) {
    return await this.productService.getDetail(productId);
  }

  @Get("get-specifications/:categoryId")
  async getAvailableProductAttributes(@Param("categoryId") id: string) {
    return await this.productService.getUniqueSpecValuesByCategory(id);
  }

  // @Get("available-product-variant/:id")
  // async getAvailableProductAttributes(@Query("id") id: string) {
  //   return await this.productService.getAvailableProductAttributes(id);
  // }
}
