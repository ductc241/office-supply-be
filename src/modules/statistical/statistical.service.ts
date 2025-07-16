import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderStatus } from "../order/types/order.enum";
import { OrderRepository } from "../order/order.repository";
import { CouponRepository } from "../coupon/coupon.repository";
import { Types } from "mongoose";
import { SummaryOrderDto } from "./dto/summary-order";
import { SummaryChartDto } from "./dto/summary-chart.dto";
import { SummaryGroup } from "./type/inde";

@Injectable()
export class StatisticalService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
  ) {}

  async getSummaryStatistics(dto: SummaryOrderDto) {
    const dateFilter = this.buildDateRangeFilter(dto.from_date, dto.to_date);
    const matchStage: Record<string, any> = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    if (dto.userId) {
      matchStage.user = new Types.ObjectId(dto.userId);
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          totalProfit: {
            $sum: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "item",
                  in: {
                    $multiply: [
                      {
                        $subtract: [
                          "$$item.price",
                          "$$item.cost_price_at_time",
                        ],
                      },
                      "$$item.quantity",
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalProfit: 1,
          averageRevenuePerOrder: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] },
            ],
          },
        },
      },
    ];

    const result = await this.orderRepository.aggregate(pipeline);
    return (
      result[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProfit: 0,
        averageRevenuePerOrder: 0,
      }
    );
  }

  // async getSummaryChart(
  //   groupBy: "day" | "month" | "year",
  //   from?: string,
  //   to?: string,
  // ) {
  //   const dateFilter = this.buildDateRangeFilter(from, to);
  //   const matchStage = {
  //     status: OrderStatus.DELIVERED,
  //     completed_at: { $ne: null },
  //     ...dateFilter,
  //   };

  //   const groupFormat = this.getGroupFormat(groupBy);

  //   return this.orderRepository.aggregate([
  //     { $match: matchStage },
  //     { $unwind: "$items" },
  //     {
  //       $group: {
  //         _id: {
  //           $dateToString: { format: groupFormat, date: "$completed_at" },
  //         },
  //         totalRevenue: {
  //           $sum: {
  //             $multiply: ["$items.price", "$items.quantity"],
  //           },
  //         },
  //         totalProfit: {
  //           $sum: {
  //             $multiply: [
  //               { $subtract: ["$items.price", "$items.cost_price_at_time"] },
  //               "$items.quantity",
  //             ],
  //           },
  //         },
  //       },
  //     },
  //     { $sort: { _id: 1 } },
  //   ]);
  // }

  async getSummaryChart(dto: SummaryChartDto) {
    const dateFilter = this.buildDateRangeFilter(dto.from_date, dto.to_date);
    const matchStage = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    const groupFormat = this.getGroupFormat(dto.group_by || SummaryGroup.DAY);

    return this.orderRepository.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          groupKey: {
            $dateToString: { format: groupFormat, date: "$completed_at" },
          },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$groupKey",
          totalRevenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"],
            },
          },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.price", "$items.cost_price_at_time"] },
                "$items.quantity",
              ],
            },
          },
          orderIds: { $addToSet: "$_id" }, // thu thập id đơn hàng duy nhất
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orderIds" }, // đếm số đơn hàng duy nhất
        },
      },
      {
        $project: {
          orderIds: 0, // loại bỏ mảng id nếu không cần
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTopSellingProducts(
    from?: string,
    to?: string,
    limit = 10,
    type: "quantity" | "revenue" | "profit" = "quantity",
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);

    const matchStage = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    const valueField =
      type === "revenue"
        ? {
            $multiply: ["$items.price", "$items.quantity"],
          }
        : type === "profit"
          ? {
              $multiply: [
                { $subtract: ["$items.price", "$items.cost_price_at_time"] },
                "$items.quantity",
              ],
            }
          : "$items.quantity"; // quantity mặc định

    return this.orderRepository.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalValue: { $sum: valueField },
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productId: "$_id",
          productName: "$productInfo.name",
          total: "$totalValue",
          _id: 0,
        },
      },
    ]);
  }

  async getTopSellingCategories(
    from?: string,
    to?: string,
    type: "revenue" | "profit" = "revenue",
    limit = 10,
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);

    const matchStage = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    const valueField =
      type === "revenue"
        ? {
            $multiply: ["$items.price", "$items.quantity"],
          }
        : {
            $multiply: [
              { $subtract: ["$items.price", "$items.cost_price_at_time"] },
              "$items.quantity",
            ],
          };

    return this.orderRepository.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          total: { $sum: valueField },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          categoryId: "$_id",
          categoryName: "$category.name",
          total: 1,
          _id: 0,
        },
      },
    ]);
  }

  async analyzeCouponUsage(couponId: string) {
    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon || !coupon.valid_from || !coupon.valid_until) {
      throw new BadRequestException(
        "Coupon không hợp lệ hoặc thiếu thời gian hiệu lực",
      );
    }

    const matchInPeriod = {
      completed_at: {
        $gte: new Date(coupon.valid_from),
        $lte: new Date(coupon.valid_until),
      },
      status: OrderStatus.DELIVERED,
    };

    const couponOrders = await this.orderRepository.aggregate([
      {
        $match: {
          ...matchInPeriod,
          coupon: new Types.ObjectId(couponId),
        },
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$total" },
                totalOrders: { $sum: 1 },
                totalProfit: {
                  $sum: {
                    $sum: {
                      $map: {
                        input: "$items",
                        as: "item",
                        in: {
                          $multiply: [
                            {
                              $subtract: [
                                "$$item.price",
                                "$$item.cost_price_at_time",
                              ],
                            },
                            "$$item.quantity",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalRevenue: { $arrayElemAt: ["$stats.totalRevenue", 0] },
          totalOrdersWithCoupon: { $arrayElemAt: ["$stats.totalOrders", 0] },
          totalProfit: { $arrayElemAt: ["$stats.totalProfit", 0] },
        },
      },
    ]);

    // Tổng đơn hàng trong thời gian coupon hiệu lực
    const totalOrdersInPeriod = await this.orderRepository.count({
      ...matchInPeriod,
    });

    const totalOrdersWithCoupon = couponOrders[0]?.totalOrdersWithCoupon || 0;

    return {
      couponId,
      couponCode: coupon.code,
      period: {
        from: coupon.valid_from,
        to: coupon.valid_until,
      },
      totalRevenue: couponOrders[0]?.totalRevenue || 0,
      totalProfit: couponOrders[0]?.totalProfit || 0,
      totalOrdersInPeriod,
      totalOrdersWithCoupon,
      couponUsageRate:
        totalOrdersInPeriod > 0
          ? totalOrdersWithCoupon / totalOrdersInPeriod
          : 0,
    };
  }

  async getCouponRevenueChart(
    couponId: string,
    groupBy: SummaryGroup.DAY | SummaryGroup.MONTH = SummaryGroup.DAY,
  ) {
    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon?.valid_from || !coupon?.valid_until) {
      throw new BadRequestException(
        "Coupon không hợp lệ hoặc thiếu thời gian hiệu lực",
      );
    }

    const matchStage = {
      coupon: new Types.ObjectId(couponId),
      completed_at: {
        $gte: new Date(coupon.valid_from),
        $lte: new Date(coupon.valid_until),
      },
      status: OrderStatus.DELIVERED,
    };

    const format = this.getGroupFormat(groupBy);

    return this.orderRepository.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            $dateToString: { format, date: "$completed_at" },
          },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.price", "$items.cost_price_at_time"] },
                "$items.quantity",
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private getGroupFormat(groupBy: SummaryGroup) {
    switch (groupBy) {
      case SummaryGroup.DAY:
        return "%Y-%m-%d";
      case SummaryGroup.MONTH:
        return "%Y-%m";
      case SummaryGroup.YEAR:
        return "%Y";
      default:
        return null;
    }
  }

  private buildDateRangeFilter(from?: string, to?: string) {
    const filter: any = {};

    if (from) {
      filter.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setUTCHours(23, 59, 59, 999);
      filter.$lte = toDate;
    }

    return Object.keys(filter).length > 0 ? { completed_at: filter } : {};
  }
}
