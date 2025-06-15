import { Controller, Get, Query } from "@nestjs/common";
import { StatisticalService } from "./statistical.service";

@Controller("statistical")
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Get("statistics/summary")
  getSummaryStatistics(
    @Query("groupBy") groupBy: "day" | "month" | "year",
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.statisticalService.getSummaryStatistics(groupBy, from, to);
  }

  @Get("profit-chart")
  getProfitChart(
    @Query("groupBy") groupBy: "day" | "month" | "year" = "day",
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.statisticalService.getProfitChart(groupBy, from, to);
  }
}
