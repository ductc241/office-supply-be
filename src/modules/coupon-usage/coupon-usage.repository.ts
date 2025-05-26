import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { BaseRepository } from "src/shared/mongo";
import { CouponUsage, CouponUsageDocument } from "./coupon-usage.schema";

@Injectable()
export class CouponUsageRepository
  extends BaseRepository<CouponUsageDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(CouponUsage.name) model: Model<CouponUsageDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
