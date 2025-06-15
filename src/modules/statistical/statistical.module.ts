import { Module } from "@nestjs/common";
import { OrderModule } from "../order/order.module";
import { StatisticalController } from "./statistical.controller";
import { StatisticalService } from "./statistical.service";

@Module({
  providers: [StatisticalService],
  controllers: [StatisticalController],
  imports: [OrderModule],
  exports: [],
})
export class StatisticalModule {}
