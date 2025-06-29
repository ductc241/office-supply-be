import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { QueryStockTransactionDto } from "./dto/query-transaction.dto";
import { StockTransactionService } from "./stock-transaction.service";
import { IPagination } from "src/shared/pagination/pagination.interface";
import { Pagination } from "src/shared/pagination/pagination.decorator";

@ApiBearerAuth()
@Controller("stock-transaction")
export class StockTransactionController {
  constructor(
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  @Get("query")
  async query(
    @Query() dto: QueryStockTransactionDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.stockTransactionService.query(dto, pagination);
  }
}
