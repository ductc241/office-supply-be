import { Module } from "@nestjs/common";
import { InventoryRepository } from "./inventory.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Inventory, InventorySchema } from "./inventory.schema";
import { InventoryService } from "./inventory.service";

@Module({
  providers: [InventoryRepository, InventoryService],
  controllers: [],
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  exports: [InventoryRepository, InventoryService],
})
export class InventoryModule {}
