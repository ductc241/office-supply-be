import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Cart, CartDocument } from "./cart.schema";

@Injectable()
export class CartRepository
  extends BaseRepository<CartDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Cart.name) model: Model<CartDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
