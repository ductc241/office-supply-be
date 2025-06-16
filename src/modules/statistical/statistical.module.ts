import { Module } from "@nestjs/common";
import { OrderModule } from "../order/order.module";
import { StatisticalController } from "./statistical.controller";
import { StatisticalService } from "./statistical.service";
import { CouponModule } from "../coupon/coupon.module";

@Module({
  providers: [StatisticalService],
  controllers: [StatisticalController],
  imports: [OrderModule, CouponModule],
})
export class StatisticalModule {}
