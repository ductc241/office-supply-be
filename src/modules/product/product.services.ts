import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductRepository } from "./product.repository";

@Injectable()
export class ProductService {
  constructor(
    private configService: ConfigService,
    private readonly ProductRepository: ProductRepository,
  ) {}

  getAll() {
    return { data: [] };
  }
}
