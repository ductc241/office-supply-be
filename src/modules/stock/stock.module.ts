import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StockInRepository } from "./repository/stock-in.repository";
import { StockOutRepository } from "./repository/stock-out.repository";
import { StockIn, StockInSchema } from "./schema/stock-in.schema";
import { StockOut, StockOutSchema } from "./schema/stock-out.schema";
import { StockInService } from "./service/stock-in.service";
import { StockOutService } from "./service/stock-out.service";
import { StockTransactionModule } from "../stock-transaction/stock-transaction.module";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { InventoryModule } from "../inventory/inventory.module";
import { StockInController } from "./stock-in.controller";

@Module({
  providers: [
    StockInRepository,
    StockOutRepository,
    StockInService,
    StockOutService,
  ],
  controllers: [StockInController],
  imports: [
    MongooseModule.forFeature([{ name: StockIn.name, schema: StockInSchema }]),
    MongooseModule.forFeature([
      { name: StockOut.name, schema: StockOutSchema },
    ]),
    ProductVariantModule,
    StockTransactionModule,
    InventoryModule,
  ],
  exports: [
    StockInRepository,
    StockOutRepository,
    StockInService,
    StockOutService,
  ],
})
export class StockModule {}
