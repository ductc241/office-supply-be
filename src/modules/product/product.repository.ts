import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Product, ProductDocument } from "./product.schema";

@Injectable()
export class ProductRepository
  extends BaseRepository<ProductDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Product.name) model: Model<ProductDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
