import { Injectable } from "@nestjs/common";
import { StockOutRepository } from "../repository/stock-out.repository";

@Injectable()
export class StockOutService {
  constructor(private readonly stockOutRepository: StockOutRepository) {}
}
