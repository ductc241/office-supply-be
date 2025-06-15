import { Module } from "@nestjs/common";
import { InventoryModule } from "../inventory/inventory.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CronService } from "./cron.service";

@Module({
  imports: [ScheduleModule.forRoot(), InventoryModule],
  providers: [CronService],
})
export class CronModule {}
