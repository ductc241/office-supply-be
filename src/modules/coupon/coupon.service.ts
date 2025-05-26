import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { CouponRepository } from "./coupon.repository";
import { ProductRepository } from "../product/product.repository";

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async validateCoupon(couponId: string, userId: string, items: any[]) {
    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    const now = new Date();
    if (now > coupon.valid_until) {
      throw new BadRequestException("Coupon expired");
    }

    if (coupon.used >= coupon.usage_limit) {
      throw new BadRequestException("Coupon usage limit exceeded");
    }

    const matchedItems = await this.filterEligibleItems(coupon, items);

    if (matchedItems.length === 0) {
      throw new BadRequestException("Coupon does not apply to any item");
    }

    const matchedTotal = matchedItems.reduce(
      (sum, item) => sum + item.base_price * item.quantity,
      0,
    );

    let discount = 0;

    if (coupon.discount_type === "percent") {
      discount = Math.floor((matchedTotal * coupon.value) / 100);
    } else if (coupon.discount_type === "amount") {
      discount = Math.min(coupon.value, matchedTotal);
    }

    return {
      coupon,
      discount,
    };
  }

  private async filterEligibleItems(coupon: any, items: any[]) {
    if (coupon.scope === "all") {
      return items;
    }

    if (coupon.scope === "product") {
      const validProductIds = (coupon.products || []).map((id) =>
        id.toString(),
      );
      return items.filter((item) =>
        validProductIds.includes(item.product.toString()),
      );
    }

    if (coupon.scope === "category") {
      const productIds = items.map((item) => new Types.ObjectId(item.product));
      const products = await this.productRepository.find({
        _id: { $in: productIds },
      });

      const categoryIds = (coupon.categories || []).map((id) => id.toString());

      const validProductIds = products
        .filter((p) =>
          p.category_path.some((catId) =>
            categoryIds.includes(catId.toString()),
          ),
        )
        .map((p) => p._id.toString());

      return items.filter((item) =>
        validProductIds.includes(item.product.toString()),
      );
    }

    return [];
  }
}
