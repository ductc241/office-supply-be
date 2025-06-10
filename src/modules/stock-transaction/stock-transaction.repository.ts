import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import {
  StockTransaction,
  StockTransactionDocument,
} from "./stock-transaction.schema";

@Injectable()
export class StockTransactionRepository
  extends BaseRepository<StockTransactionDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(StockTransaction.name) model: Model<StockTransactionDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
