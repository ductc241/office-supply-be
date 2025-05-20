import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Category, CategoryDocument } from "./category.schema";

@Injectable()
export class CategoryRepository
  extends BaseRepository<CategoryDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Category.name) model: Model<CategoryDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
