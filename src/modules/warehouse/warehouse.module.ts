import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Warehouse, WarehouseSchema } from "./warehouse.schema";
import { WarehouseRepository } from "./warehouse.repository";
import { WarehouseService } from "./warehouse.service";

@Module({
  providers: [WarehouseRepository, WarehouseService],
  controllers: [],
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
    ]),
  ],
  exports: [WarehouseRepository, WarehouseService],
})
export class WarehouseModule {}
