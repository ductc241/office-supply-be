import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Order, OrderDocument } from "./order.schema";

@Injectable()
export class OrderRepository
  extends BaseRepository<OrderDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Order.name) model: Model<OrderDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
