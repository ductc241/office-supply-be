import { Controller, Get, Param, Query } from "@nestjs/common";
import { StatisticalService } from "./statistical.service";

@Controller("statistical")
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Get("summary")
  getSummaryStatistics(
    @Query("groupBy") groupBy: "day" | "month" | "year",
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.statisticalService.getSummaryStatistics(groupBy, from, to);
  }

  @Get("summary/chart")
  getSummaryChart(
    @Query("groupBy") groupBy: "day" | "month" | "year" = "day",
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.statisticalService.getSummaryChart(groupBy, from, to);
  }

  @Get("top-selling-products")
  getTopSellingProducts(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: "quantity" | "revenue" | "profit",
  ) {
    return this.statisticalService.getTopSellingProducts(
      from,
      to,
      limit ? parseInt(limit) : 10,
      type || "quantity",
    );
  }

  @Get("top-selling-categories")
  getTopSellingCategories(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: "revenue" | "profit",
  ) {
    return this.statisticalService.getTopSellingCategories(
      from,
      to,
      type,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get("coupon/:couponId/summary")
  analyzeCoupon(@Param("couponId") couponId: string) {
    return this.statisticalService.analyzeCouponUsage(couponId);
  }

  @Get("coupon/:couponId/chart")
  getCouponChart(
    @Param("couponId") couponId: string,
    @Query("groupBy") groupBy: "day" | "month" = "day",
  ) {
    return this.statisticalService.getCouponRevenueChart(couponId, groupBy);
  }
}
