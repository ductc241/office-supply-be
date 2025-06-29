import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { StockInService } from "./service/stock-in.service";
import { CreateStockInDto } from "./dto/create-stock-in.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("stock-in")
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Post()
  async create(@Body() dto: CreateStockInDto) {
    return await this.stockInService.create(dto);
  }

  @Get("query")
  async query() {
    return await this.stockInService.query();
  }
}
