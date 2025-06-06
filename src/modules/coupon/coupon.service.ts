import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductRepository } from "../product/product.repository";
import { CouponRepository } from "./coupon.repository";
import { Types } from "mongoose";
import { CouponUsageService } from "../coupon-usage/coupon-usage.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { CouponScope } from "./types/coupon.enum";

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly productRepository: ProductRepository,
    private readonly couponUsageService: CouponUsageService,
  ) {}

  async createCoupon(createCouponDto: CreateCouponDto) {
    try {
      // Validate coupon data before creation
      await this.validateCouponData(createCouponDto);

      // Check if coupon code already exists
      const existingCoupon = await this.couponRepository.findOne({
        code: createCouponDto.code.toUpperCase(),
      });

      if (existingCoupon) {
        throw new BadRequestException("Mã coupon đã tồn tại");
      }

      // Prepare coupon data
      const couponData = {
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
        min_order_value: createCouponDto.min_order_value || 0,
        user_limit: createCouponDto.user_limit || 1,
        used: 0,
        is_active: createCouponDto.is_active ?? true,
        combinable: createCouponDto.combinable ?? false,
      };

      return this.couponRepository.create(couponData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async validateCouponData(couponData: CreateCouponDto) {
    const errors: string[] = [];

    // Basic validation
    if (!couponData.code || couponData.code.trim().length === 0) {
      errors.push("Mã coupon không được để trống");
    }

    if (couponData.code && couponData.code.length < 3) {
      errors.push("Mã coupon phải có ít nhất 3 ký tự");
    }

    if (couponData.code && couponData.code.length > 50) {
      errors.push("Mã coupon không được quá 50 ký tự");
    }

    // Validate code format (alphanumeric and some special chars)
    if (couponData.code && !/^[A-Za-z0-9_-]+$/.test(couponData.code)) {
      errors.push(
        "Mã coupon chỉ được chứa chữ cái, số, gạch dưới và gạch ngang",
      );
    }

    // Validate value
    if (couponData.value <= 0) {
      errors.push("Giá trị giảm giá phải lớn hơn 0");
    }

    if (couponData.discount_type === "percent" && couponData.value > 100) {
      errors.push("Phần trăm giảm giá không được vượt quá 100%");
    }

    // Validate max_discount
    if (couponData.max_discount < 0) {
      errors.push("Số tiền giảm tối đa không được âm");
    }

    if (
      couponData.discount_type === "percent" &&
      couponData.max_discount <= 0
    ) {
      errors.push("Số tiền giảm tối đa phải lớn hơn 0 khi dùng phần trăm");
    }

    if (
      couponData.user_limit &&
      couponData.user_limit > couponData.usage_limit
    ) {
      errors.push(
        "Số lần sử dụng trên mỗi user không được vượt quá tổng số lần sử dụng",
      );
    }

    // Validate dates
    const now = new Date();
    const validFrom = new Date(couponData.valid_from);
    const validUntil = new Date(couponData.valid_until);

    if (isNaN(validFrom.getTime())) {
      errors.push("Ngày bắt đầu không hợp lệ");
    }

    if (isNaN(validUntil.getTime())) {
      errors.push("Ngày kết thúc không hợp lệ");
    }

    if (validFrom >= validUntil) {
      errors.push("Ngày kết thúc phải sau ngày bắt đầu");
    }

    if (validUntil <= now) {
      errors.push("Ngày kết thúc phải trong tương lai");
    }

    // Validate scope-specific data
    if (couponData.scope === CouponScope.PRODUCT) {
      if (
        !couponData.applicable_product_ids ||
        couponData.applicable_product_ids.length === 0
      ) {
        errors.push(
          "Phải chỉ định ít nhất một sản phẩm khi scope là 'product'",
        );
      } else {
        // Validate product IDs exist
        const validProductIds: string[] = [];
        for (const productId of couponData.applicable_product_ids) {
          if (!Types.ObjectId.isValid(productId)) {
            errors.push(`ID sản phẩm không hợp lệ: ${productId}`);
          } else {
            validProductIds.push(productId);
          }
        }

        // if (validProductIds.length > 0) {
        //   const existingProducts = await this.productRepository.find({
        //     _id: { $in: validProductIds.map((id) => new Types.ObjectId(id)) },
        //   });

        //   if (existingProducts.length !== validProductIds.length) {
        //     errors.push("Một số sản phẩm được chỉ định không tồn tại");
        //   }
        // }
      }
    }

    if (couponData.scope === CouponScope.CATEGORY) {
      if (
        !couponData.applicable_category_ids ||
        couponData.applicable_category_ids.length === 0
      ) {
        errors.push(
          "Phải chỉ định ít nhất một danh mục khi scope là 'category'",
        );
      } else {
        // Validate category IDs format
        for (const categoryId of couponData.applicable_category_ids) {
          if (!Types.ObjectId.isValid(categoryId)) {
            errors.push(`ID danh mục không hợp lệ: ${categoryId}`);
          }
        }
        // Note: Add category existence validation if you have CategoryRepository
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: "Dữ liệu coupon không hợp lệ",
        errors,
      });
    }
  }

  async validateCoupon(couponId: string, userId: string, items: any[]) {
    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    if (!coupon.is_active) {
      throw new BadRequestException("Coupon đã bị vô hiệu hóa");
    }

    const now = new Date();
    if (coupon.valid_from && now > coupon.valid_until) {
      throw new BadRequestException("Coupon expired");
    }

    if (coupon.usage_limit && coupon.used >= coupon.usage_limit) {
      throw new BadRequestException("Coupon usage limit exceeded");
    }

    const usageCount = await this.couponUsageService.countUsageByUser(
      userId,
      couponId,
    );
    if (coupon.user_limit && usageCount >= coupon.user_limit) {
      throw new BadRequestException(
        "Bạn đã sử dụng mã này quá số lần cho phép",
      );
    }

    const matchedItems = await this.filterEligibleItems(coupon, items);

    if (matchedItems.length === 0) {
      throw new BadRequestException("Coupon does not apply to any item");
    }

    const matchedTotal = matchedItems.reduce(
      (sum, item) => sum + item.base_price * item.quantity,
      0,
    );

    // Check minimum order value
    if (coupon.min_order_value > 0 && matchedTotal < coupon.min_order_value) {
      throw new BadRequestException(
        `Đơn hàng phải có giá trị tối thiểu ${coupon.min_order_value.toLocaleString("vi-VN")}đ để sử dụng coupon`,
      );
    }

    let discount = 0;

    if (coupon.discount_type === "percent") {
      const tempDiscount = Math.floor((matchedTotal * coupon.value) / 100);

      if (tempDiscount > coupon.max_discount) {
        discount = coupon.max_discount;
      } else {
        discount = tempDiscount;
      }
    } else if (coupon.discount_type === "amount") {
      discount = Math.min(coupon.value, matchedTotal);
    }

    return {
      coupon,
      discount,
      matchedItems,
    };
  }

  private async filterEligibleItems(coupon: any, items: any[]) {
    if (coupon.scope === CouponScope.ORDER) return items;

    if (coupon.scope === CouponScope.PRODUCT) {
      const validProductIds = (coupon.applicable_product_ids || []).map((id) =>
        id.toString(),
      );

      return items.filter((item) =>
        validProductIds.includes(item.product.toString()),
      );
    }

    if (coupon.scope === CouponScope.CATEGORY) {
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

  async markCouponAsUsed(couponId: string) {
    return this.couponRepository.updateById(couponId, {
      $inc: { used: 1 },
    });
  }

  async restoreCouponUsage(couponId: string) {
    return this.couponRepository.updateById(couponId, {
      $inc: { used_count: -1 },
    });
  }

  async getAvailableCouponsForUser(userId: string) {
    const now = new Date();

    const coupons = await this.couponRepository.find(
      {
        is_active: true,
        valid_from: { $lte: now },
        valid_until: { $gte: now },
        $expr: {
          $lt: ["$used", "$usage_limit"],
        },
      },
      {
        projection:
          "label image_preview max_discount min_order_value user_limit used discount_type value valid_until",
      },
    );

    const available: any[] = [];

    for (const coupon of coupons) {
      const usageCount = await this.couponUsageService.countUsageByUser(
        userId,
        coupon._id.toString(),
      );

      if (usageCount < coupon.user_limit) {
        available.push(coupon);
      }
    }

    return available;
  }

  // async getAppliableCouponsForUser(userId: string) {}

  async getCouponDetail(couponId) {
    return await this.couponRepository.findOne(
      {
        _id: couponId,
      },
      {
        populate: {
          path: "applicable_product_ids",
          select: "name",
        },
      },
    );
  }
}
