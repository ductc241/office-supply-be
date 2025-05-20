import { Body, Controller, Get, Post } from "@nestjs/common";
import { ProductService } from "./product.services";
import { CreateFullProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProtocols() {
    return await this.productService.getAll();
  }

  @Post()
  create(@Body() dto: CreateFullProductDto) {
    return this.productService.create(dto);
  }
}
