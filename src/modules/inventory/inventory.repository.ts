import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { InventoryDocument, Inventory } from "./inventory.schema";

@Injectable()
export class InventoryRepository
  extends BaseRepository<InventoryDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Inventory.name) model: Model<InventoryDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
