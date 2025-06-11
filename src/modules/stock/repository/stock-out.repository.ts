import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { StockOut, StockOutDocument } from "../schema/stock-out.schema";

@Injectable()
export class StockOutRepository
  extends BaseRepository<StockOutDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(StockOut.name) model: Model<StockOutDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
