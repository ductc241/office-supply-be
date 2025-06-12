import { Types } from "mongoose";
import { StockTransactionType } from "../types/stock-transaction.enum";

export class CreateStockTransactionDto {
  type: StockTransactionType;
  variant_id: Types.ObjectId;
  product_id: Types.ObjectId;
  quantity: number;
  cost_price: number;
  average_cost_price_before?: number;
  average_cost_price_after?: number;
  note?: string;
  reference_id?: Types.ObjectId;
}
