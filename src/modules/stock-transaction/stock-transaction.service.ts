import { Injectable } from "@nestjs/common";
import { StockTransactionRepository } from "./stock-transaction.repository";

@Injectable()
export class StockTransactionService {
  constructor(
    private readonly stockTransactionRepository: StockTransactionRepository,
  ) {}
}
