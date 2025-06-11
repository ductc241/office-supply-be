import { Types } from "mongoose";
import {
  StockTransactionReferenceType,
  StockTransactionType,
} from "../types/stock-transaction.enum";

export class CreateStockTransactionDto {
  variant_id: Types.ObjectId;
  quantity: number;
  type: StockTransactionType;
  note?: string;
  reference_type?: StockTransactionReferenceType;
  reference_id?: string;
}
