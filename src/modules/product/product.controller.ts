import { Controller, Get } from "@nestjs/common";
import { ProductService } from "./product.services";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProtocols() {
    return await this.productService.getAll();
  }
}
