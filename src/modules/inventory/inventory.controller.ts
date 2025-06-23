import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { InventoryService } from "./inventory.service";

@ApiBearerAuth()
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("query")
  async query() {
    // return await this.productService.query(dto, pagination);
    return await this.inventoryService.query();
  }
}
