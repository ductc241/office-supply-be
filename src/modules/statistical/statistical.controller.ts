import { Controller, Get, Param, Query } from "@nestjs/common";
import { StatisticalService } from "./statistical.service";
import { SummaryOrderDto } from "./dto/summary-order";
import { SummaryChartDto } from "./dto/summary-chart.dto";
import { SummaryGroup } from "./type/inde";

@Controller("statistical")
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Get("summary")
  getSummaryStatistics(@Query() dto: SummaryOrderDto) {
    return this.statisticalService.getSummaryStatistics(dto);
  }

  @Get("summary/chart")
  getSummaryChart(@Query() dto: SummaryChartDto) {
    return this.statisticalService.getSummaryChart(dto);
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
    @Query("groupBy")
    groupBy: SummaryGroup.DAY | SummaryGroup.MONTH = SummaryGroup.DAY,
  ) {
    return this.statisticalService.getCouponRevenueChart(couponId, groupBy);
  }
}
