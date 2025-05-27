import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { CouponUsageRepository } from "./coupon-usage.repository";

@Injectable()
export class CouponUsageService {
  constructor(private readonly couponUsageRepository: CouponUsageRepository) {}

  async logUsage(
    couponId: string,
    userId: string,
    orderId: string,
    discount: number,
  ) {
    return this.couponUsageRepository.create({
      coupon: new Types.ObjectId(couponId),
      user: new Types.ObjectId(userId),
      order: new Types.ObjectId(orderId),
      discount_value: discount,
      status: "used",
      used_at: new Date(),
    });
  }

  async markAsCancelled(orderId: string) {
    const usage = await this.couponUsageRepository.findOne({ order: orderId });
    if (!usage) throw new NotFoundException("Coupon usage not found");
    return this.couponUsageRepository.updateById(usage._id, {
      status: "cancelled",
      cancelled_at: new Date(),
    });
  }

  async markAsRefunded(orderId: string) {
    const usage = await this.couponUsageRepository.findOne({ order: orderId });
    if (!usage) throw new NotFoundException("Coupon usage not found");
    return this.couponUsageRepository.updateById(usage._id, {
      status: "refunded",
      refunded_at: new Date(),
    });
  }

  async getUsageByUser(userId: string) {
    return this.couponUsageRepository.find({ user: userId });
  }

  async getUsageByOrder(orderId: string) {
    return this.couponUsageRepository.findOne({ order: orderId });
  }

  async getStatsByCoupon(couponId: string) {
    return this.couponUsageRepository.aggregate([
      { $match: { coupon: new Types.ObjectId(couponId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_discount: { $sum: "$discount_value" },
        },
      },
    ]);
  }

  async countUsageByUser(userId: string, couponId: string) {
    return this.couponUsageRepository.count({
      user: new Types.ObjectId(userId),
      coupon: new Types.ObjectId(couponId),
      status: "used",
    });
  }
}
