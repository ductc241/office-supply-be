import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StockInRepository } from "./repository/stock-in.repository";
import { StockOutRepository } from "./repository/stock-out.repository";
import { StockIn, StockInSchema } from "./schema/stock-in.schema";
import { StockOut, StockOutSchema } from "./schema/stock-out.schema";
import { StockInService } from "./service/stock-in.service";
import { StockOutService } from "./service/stock-out.service";

@Module({
  providers: [
    StockInRepository,
    StockOutRepository,
    StockInService,
    StockOutService,
  ],
  controllers: [],
  imports: [
    MongooseModule.forFeature([{ name: StockIn.name, schema: StockInSchema }]),
    MongooseModule.forFeature([
      { name: StockOut.name, schema: StockOutSchema },
    ]),
  ],
  exports: [
    StockInRepository,
    StockOutRepository,
    StockInService,
    StockOutService,
  ],
})
export class StockModule {}
