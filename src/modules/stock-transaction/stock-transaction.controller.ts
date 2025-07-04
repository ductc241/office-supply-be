import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { QueryStockTransactionDto } from "./dto/query-transaction.dto";
import { StockTransactionService } from "./stock-transaction.service";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { Pagination } from "src/shared/pagination/pagination.decorator";

@ApiBearerAuth()
@Controller("stock-transaction")
export class StockTransactionController {
  constructor(
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  @Get("query")
  @ApiPagination()
  async query(
    @Pagination() pagination: IPagination,
    @Query() dto: QueryStockTransactionDto,
  ) {
    return await this.stockTransactionService.query(dto, pagination);
  }
}
