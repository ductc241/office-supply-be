import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InventoryService } from "../inventory/inventory.service";

@Injectable()
export class CronService {
  constructor(private readonly inventoryService: InventoryService) {}

  // onModuleInit() {
  //   this.checkLowStock();
  // }

  @Cron(CronExpression.EVERY_HOUR, { name: "checkLowStock" })
  async checkLowStock() {
    return this.inventoryService.checkLowStock();
  }
}
