import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-status-order.dto";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { CouponService } from "../coupon/coupon.service";
import { QueryOptions, Types } from "mongoose";
import { CouponUsageService } from "../coupon-usage/coupon-usage.service";
import { OrderStatus } from "./types/order.enum";
import { InventoryRepository } from "../inventory/inventory.repository";
import { StockTransactionService } from "../stock-transaction/stock-transaction.service";
import { StockTransactionType } from "../stock-transaction/types/stock-transaction.enum";
import { SendMailService } from "../mail/send-mail.service";
import { SocketGateway } from "../socket/socket.gateway";
import { QueryOrderDto } from "./dto/query-order.dto";
import { IPagination } from "src/shared/pagination/pagination.interface";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly couponService: CouponService,
    private readonly couponUsageService: CouponUsageService,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly stockTransactionService: StockTransactionService,
    private readonly sendMailService: SendMailService,
    private readonly socketGateway: SocketGateway,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async query(pagination: IPagination, query: QueryOrderDto) {
    let conditions: Record<string, any> = {};
    let options: QueryOptions = {
      populate: [
        {
          path: "user",
          select: "full_name email",
        },
      ],
      projection: "user subtotal discount total status createdAt",
      sort: { createdAt: -1 },
    };

    if (query.status) {
      conditions = { ...conditions, status: query.status };
    }

    if (query.order_id) {
      conditions = { ...conditions, _id: new Types.ObjectId(query.order_id) };
    }

    if (query.user_id) {
      conditions = { ...conditions, user: new Types.ObjectId(query.user_id) };
    }

    if (query.from_date) {
      conditions = {
        ...conditions,
        createdAt: {
          $gte: new Date(query.from_date),
        },
      };
    }

    if (query.to_date) {
      conditions = {
        ...conditions,
        createdAt: {
          ...conditions.createdAt,
          $lte: new Date(query.to_date).setUTCHours(23, 59, 59, 999),
        },
      };
    }

    if (pagination) {
      options = {
        ...options,
        limit: pagination.perPage,
        skip: pagination.startIndex,
      };
    }

    const [result, totalCount] = await Promise.all([
      this.orderRepository.find(conditions, options),
      this.orderRepository.count(conditions),
    ]);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      totalCount ?? 0,
    );

    return {
      items: result,
      headers: responseHeaders,
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const variants = await this.productVariantRepository.find({
      _id: { $in: dto.items.map((i) => new Types.ObjectId(i.variant)) },
    });
    const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

    // check inventory
    const orderItemInventory = await this.inventoryRepository.find({
      variant: { $in: variants.map((v) => v._id) },
    });
    const orderItemsBelowMinStock = [];
    orderItemInventory.forEach((inventory) => {
      const orderItem = dto.items.find(
        (i) => i.variant === inventory.variant.toString(),
      );

      if (
        inventory.low_stock_threshold &&
        inventory.quantity - orderItem.quantity < inventory.low_stock_threshold
      ) {
        orderItemsBelowMinStock.push({
          ...orderItem,
          stock: inventory.quantity - inventory.low_stock_threshold,
        });
      }

      if (
        !inventory.low_stock_threshold &&
        inventory.quantity - orderItem.quantity < 0
      ) {
        orderItemsBelowMinStock.push({
          ...orderItem,
          stock: inventory.quantity,
        });
      }
    });
    if (orderItemsBelowMinStock.length > 0) {
      throw new BadRequestException("So luong ton kho cua san pham khong du", {
        cause: orderItemsBelowMinStock,
      });
    }

    // create input data
    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const variant = variantMap.get(item.variant);
      if (!variant) {
        throw new BadRequestException(`Variant not found`, {
          cause: item,
        });
      }

      const basePrice = variant.base_price;
      subtotal += basePrice * item.quantity;

      return {
        ...item,
        product: variant.product,
        variant: variant._id,
        base_price: basePrice,
        cost_price_at_time: variant.average_cost_price || 0,
        quantity: item.quantity,
        price: basePrice,
        discount_from_coupon: 0,
        is_coupon_applied: false,
      };
    });

    // check coupon & update input data
    let discount = 0;
    if (dto.coupon) {
      const result = await this.couponService.validateCoupon(
        dto.coupon,
        userId,
        orderItems,
      );

      discount = result.discount;
      const matchedItemIds = result.matchedItems.map((item) => item.variant);
      const totalLinePrice = result.matchedItems.reduce(
        (s, i) => s + i.price * i.quantity,
        0,
      );

      orderItems.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const ratio = itemTotal / totalLinePrice;

        if (matchedItemIds.includes(item.variant)) {
          item.is_coupon_applied = true;
          item.discount_from_coupon = Math.round(discount * ratio);
          item.price -= item.discount_from_coupon / item.quantity;
        }
      });
    }

    // create order
    const total = subtotal - discount + dto.shipping_fee;
    const order = await this.orderRepository.create({
      user: new Types.ObjectId(userId),
      items: orderItems,
      subtotal,
      discount,
      total,
      coupon: dto.coupon ? new Types.ObjectId(dto.coupon) : null,
      shipping_fee: dto.shipping_fee,
      status: OrderStatus.PENDING,
      payment_method: dto.payment_method,
      shipping_method: dto.shipping_method,
      shipping_address: dto.shipping_address,
    });

    // log transaction & decrease quantity
    orderItemInventory.forEach(async (i) => {
      const orderItemQuantity = dto.items.find(
        (ot) => (ot.variant = i.variant.toString()),
      );
      const variant = variantMap.get(i.variant.toString());

      await this.stockTransactionService.create({
        type: StockTransactionType.ORDER_EXPORT,
        variant_id: variant._id,
        product_id: variant.product,
        quantity: orderItemQuantity.quantity,
        cost_price: variant.average_cost_price,
        reference_id: order._id,
      });
    });

    // log coupon usage
    if (dto.coupon) {
      await this.couponService.markCouponAsUsed(dto.coupon);
      await this.couponUsageService.logUsage(
        dto.coupon,
        userId,
        order._id.toString(),
        discount,
      );
    }

    //send mail
    // this.sendMailService.senNewOrderMail(order._id.toString());

    return order;
  }

  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne(
      {
        _id: new Types.ObjectId(orderId),
        // user: new Types.ObjectId(userId),
      },
      {
        populate: [
          {
            path: "items.product",
            select: "name image_preview",
          },
          {
            path: "items.variant",
            select: "sku attributes base_price price is_coupon_applied",
          },
        ],
        projection: {
          user: 0,
        },
      },
    );

    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async getOrdersForUser(userId: string) {
    return this.orderRepository.find(
      { user: new Types.ObjectId(userId) },
      {
        sort: "-createdAt",
        populate: [
          {
            path: "items.product",
            select: "name image_preview",
          },
          {
            path: "items.variant",
            select: "attributes",
          },
        ],
        projection: {
          items: {
            product: 1,
            variant: 1,
            quantity: 1,
            base_price: 1,
            discount_from_coupon: 1,
            price: 1,
            is_coupon_applied: 1,
          },
          status: 1,
          subtotal: 1,
          discount: 1,
          total: 1,
          createdAt: 1,
        },
      },
    );
  }

  async getOrdersByProductId(productId: string) {
    const objectId = new Types.ObjectId(productId);

    // Chỉ lấy các đơn hàng có chứa sản phẩm cần lọc
    const orders = await this.orderRepository.find(
      {
        "items.product": objectId,
      },
      {
        projection: {
          _id: 1,
          total: 1,
          items: 1,
          status: 1,
        },
      },
    );

    const results = [];

    for (const order of orders) {
      // Lọc các item trong đơn hàng có liên quan đến productId
      const matchedItems = order.items.filter(
        (item) => item.product.toString() === productId,
      );

      const totalProductRevenue = matchedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const totalProductProfit = matchedItems.reduce(
        (sum, item) =>
          sum + (item.price - item.cost_price_at_time) * item.quantity,
        0,
      );

      const totalQuantity = matchedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const valueRatio =
        order.total > 0 ? (totalProductRevenue / order.total) * 100 : 0;

      results.push({
        order_id: order._id,
        quantity: totalQuantity,
        revenue: totalProductRevenue,
        profit: totalProductProfit,
        order_total: order.total,
        value_ratio: Number(valueRatio.toFixed(4)), // tỷ lệ giá trị sản phẩm trong đơn hàng
        status: order.status,
      });
    }

    return results;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const now = new Date();
    const update: any = { status: dto.status };

    if (dto.status === OrderStatus.PAID) update.paid_at = now;
    if (dto.status === OrderStatus.SHIPPING) update.shipped_at = now;
    if (dto.status === OrderStatus.DELIVERED) update.completed_at = now;
    if (dto.status === OrderStatus.CANCELLED) update.cancelled_at = now;
    if (dto.status === OrderStatus.REFUNDED) update.refunded_at = now;

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException("Order not found");

    if (
      dto.status === OrderStatus.PENDING &&
      order.status !== OrderStatus.PENDING
    ) {
      throw new BadRequestException(
        "The order has been confirmed and cannot be changed.",
      );
    }

    if (dto.status === OrderStatus.DELIVERED) {
      await this.userRepository.updateById(order.user.toString(), {
        $inc: {
          total_order: 1,
          total_shopping_amount: order.total,
        },
      });
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    ) {
      throw new BadRequestException(
        "The order has been completed and cannot be changed.",
      );
    }

    if (order.coupon) {
      if (dto.status === OrderStatus.CANCELLED) {
        await this.couponUsageService.markAsCancelled(orderId);
        await this.couponService.restoreCouponUsage(order.coupon.toString());
      }

      if (dto.status === OrderStatus.REFUNDED) {
        await this.couponUsageService.markAsRefunded(orderId);
      }
    }

    this.socketGateway.sendOrderStatus(
      order.user.toString(),
      orderId,
      dto.status,
    );

    return this.orderRepository.updateById(orderId, update);
  }

  // không tạo stock-in do hàng chưa đc giao ra ngoài
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderRepository.findOne({
      _id: new Types.ObjectId(orderId),
      user: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Only pending orders can be cancelled");
    }

    // re-import product
    order.items.forEach(async (orderItem) => {
      const variant = await this.productVariantRepository.findById(
        orderItem.variant,
      );
      const inventory = await this.inventoryRepository.findOne({
        variant: new Types.ObjectId(orderItem.variant),
      });

      const new_average_cost_price =
        (inventory.quantity * variant.average_cost_price +
          orderItem.quantity * orderItem.cost_price_at_time) /
        (inventory.quantity + orderItem.quantity);

      // log + update quantiry
      await this.stockTransactionService.create({
        type: StockTransactionType.ORDER_CANCEL_IMPORT,
        variant_id: orderItem.variant,
        product_id: orderItem.product,
        quantity: orderItem.quantity,
        cost_price: orderItem.cost_price_at_time,
        average_cost_price_before: variant.average_cost_price,
        average_cost_price_after: new_average_cost_price,
        reference_id: new Types.ObjectId(orderId),
      });
    });

    return this.updateStatus(orderId, { status: OrderStatus.CANCELLED });
  }

  async adminCancelOrder(orderId: string) {
    const order = await this.orderRepository.findOne({
      _id: new Types.ObjectId(orderId),
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Only pending orders can be cancelled");
    }

    // re-import product
    order.items.forEach(async (orderItem) => {
      const variant = await this.productVariantRepository.findById(
        orderItem.variant,
      );
      const inventory = await this.inventoryRepository.findOne({
        variant: new Types.ObjectId(orderItem.variant),
      });

      const new_average_cost_price =
        (inventory.quantity * variant.average_cost_price +
          orderItem.quantity * orderItem.cost_price_at_time) /
        (inventory.quantity + orderItem.quantity);

      // log + update quantiry
      await this.stockTransactionService.create({
        type: StockTransactionType.ORDER_CANCEL_IMPORT,
        variant_id: orderItem.variant,
        product_id: orderItem.product,
        quantity: orderItem.quantity,
        cost_price: orderItem.cost_price_at_time,
        average_cost_price_before: variant.average_cost_price,
        average_cost_price_after: new_average_cost_price,
        reference_id: new Types.ObjectId(orderId),
      });
    });

    return this.updateStatus(orderId, { status: OrderStatus.CANCELLED });
  }

  //  tạo stock-in do hàng đã đc vận chuyển đi
  async refundOrder() {}
}
