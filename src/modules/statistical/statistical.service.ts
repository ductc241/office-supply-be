import { Injectable } from "@nestjs/common";
import { OrderStatus } from "../order/types/order.enum";
import { OrderRepository } from "../order/order.repository";

@Injectable()
export class StatisticalService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getSummaryStatistics(
    groupBy: "day" | "month" | "year",
    from?: string,
    to?: string,
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    const matchStage = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    const groupFormat = this.getGroupFormat(groupBy);

    const pipeline: any[] = [{ $match: matchStage }];

    pipeline.push(
      {
        $addFields: {
          groupKey: {
            $dateToString: { format: groupFormat, date: "$completed_at" },
          },
        },
      },
      {
        $group: {
          _id: "$groupKey",
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
        $addFields: {
          averageRevenuePerOrder: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] },
            ],
          },
        },
      },
      { $sort: { _id: 1 } },
    );

    const summaryStatistics = await this.orderRepository.aggregate(pipeline);
    return summaryStatistics ? summaryStatistics[0] : null;
  }

  async getProfitChart(
    groupBy: "day" | "month" | "year",
    from?: string,
    to?: string,
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    const matchStage = {
      status: OrderStatus.DELIVERED,
      completed_at: { $ne: null },
      ...dateFilter,
    };

    const groupFormat = this.getGroupFormat(groupBy);

    return this.orderRepository.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            // $dateToString: { format: groupFormat, date: "$createdAt" },
            $dateToString: { format: groupFormat, date: "$completed_at" },
          },
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
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private getGroupFormat(groupBy: "day" | "month" | "year") {
    switch (groupBy) {
      case "day":
        return "%Y-%m-%d";
      case "month":
        return "%Y-%m";
      case "year":
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
    // return Object.keys(filter).length > 0 ? { createdAt: filter } : {};
  }
}
