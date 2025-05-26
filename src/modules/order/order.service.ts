import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-status-order.dto";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { CouponService } from "../coupon/coupon.service";
import { Types } from "mongoose";

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly couponService: CouponService,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const variants = await this.productVariantRepository.find({
      _id: { $in: dto.items.map((i) => new Types.ObjectId(i.variant)) },
    });

    const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const variant = variantMap.get(item.variant);
      if (!variant) {
        throw new BadRequestException(`Variant ${item.variant} not found`);
      }

      const basePrice = variant.base_price;
      subtotal += basePrice * item.quantity;

      return {
        ...item,
        product: variant.product,
        variant: variant._id,
        base_price: basePrice,
        cost_price_at_time: variant.average_cost_price || 0,
        price: basePrice,
        quantity: item.quantity,
        is_coupon_applied: false,
        discount_from_coupon: 0,
      };
    });

    let discount = 0;
    if (dto.coupon) {
      const result = await this.couponService.validateCoupon(
        dto.coupon,
        userId,
        orderItems,
      );
      discount = result.discount;

      const totalLinePrice = orderItems.reduce(
        (s, i) => s + i.price * i.quantity,
        0,
      );
      orderItems.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const ratio = itemTotal / totalLinePrice;
        item.discount_from_coupon = Math.round(discount * ratio);
        item.price -= item.discount_from_coupon / item.quantity;
        item.is_coupon_applied = true;
      });
    }

    const total = subtotal - discount + dto.shipping_fee;

    const order = await this.orderRepository.create({
      user: new Types.ObjectId(userId),
      items: orderItems,
      subtotal,
      discount,
      total,
      coupon: dto.coupon || null,
      shipping_fee: dto.shipping_fee,
      status: "pending",
      payment_method: dto.payment_method,
      shipping_method: dto.shipping_method,
      shipping_address: dto.shipping_address,
    });

    return order;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const now = new Date();
    const update: any = { status: dto.status };

    if (dto.status === "paid") update.paid_at = now;
    if (dto.status === "shipping") update.shipped_at = now;
    if (dto.status === "delivered") update.completed_at = now;
    if (dto.status === "cancelled") update.cancelled_at = now;

    return this.orderRepository.updateById(orderId, update);
  }
}
