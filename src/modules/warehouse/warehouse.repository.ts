import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Warehouse, WarehouseDocument } from "./warehouse.schema";

@Injectable()
export class WarehouseRepository
  extends BaseRepository<WarehouseDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Warehouse.name) model: Model<WarehouseDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
