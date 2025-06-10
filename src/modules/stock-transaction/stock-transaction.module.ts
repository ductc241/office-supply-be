import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  StockTransaction,
  StockTransactionSchema,
} from "./stock-transaction.schema";
import { StockTransactionRepository } from "./stock-transaction.repository";
import { StockTransactionService } from "./stock-transaction.service";

@Module({
  providers: [StockTransactionRepository, StockTransactionService],
  controllers: [],
  imports: [
    MongooseModule.forFeature([
      { name: StockTransaction.name, schema: StockTransactionSchema },
    ]),
  ],
  exports: [StockTransactionRepository, StockTransactionService],
})
export class StockTransactionModule {}
