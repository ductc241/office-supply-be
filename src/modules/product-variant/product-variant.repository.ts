import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import {
  ProductVariant,
  ProductVariantDocument,
} from "./product-variant.schema";

@Injectable()
export class ProductVariantRepository
  extends BaseRepository<ProductVariantDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(ProductVariant.name) model: Model<ProductVariantDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
