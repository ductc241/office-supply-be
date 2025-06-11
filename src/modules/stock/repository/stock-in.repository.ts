import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { StockIn, StockInDocument } from "../schema/stock-in.schema";

@Injectable()
export class StockInRepository
  extends BaseRepository<StockInDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(StockIn.name) model: Model<StockInDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
