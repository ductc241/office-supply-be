import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { InventoryService } from "./inventory.service";
import { QueryInventoryDto } from "./dto/query-inventory.dto";

@ApiBearerAuth()
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("query")
  async query(@Query() dto: QueryInventoryDto) {
    return await this.inventoryService.query(dto);
  }
}
