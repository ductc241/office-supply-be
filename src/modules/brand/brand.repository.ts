import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Brand, BrandDocument } from "./brand.schema";

@Injectable()
export class BrandRepository
  extends BaseRepository<BrandDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Brand.name) model: Model<BrandDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
