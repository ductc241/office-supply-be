import { Injectable } from "@nestjs/common";
import { StockInRepository } from "../repository/stock-in.repository";

@Injectable()
export class StockInService {
  constructor(private readonly stockInRepository: StockInRepository) {}
}
