import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { Coupon, CouponDocument } from "./coupon.schema";

@Injectable()
export class CouponRepository
  extends BaseRepository<CouponDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Coupon.name) model: Model<CouponDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
