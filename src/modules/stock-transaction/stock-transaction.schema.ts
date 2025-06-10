import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
  StockTransactionReferenceType,
  StockTransactionType,
} from "./types/stock-transaction.enum";

@Schema({ timestamps: true })
export class StockTransaction {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Warehouse", required: true })
  warehouse: Types.ObjectId;

  @Prop({ enum: StockTransactionType, required: true })
  type: StockTransactionType;

  @Prop({ required: true })
  quantity: number; // âm nếu xuất kho

  @Prop()
  reason?: string; // ví dụ: "Order #1234", "Manual adjust", ...

  @Prop({ enum: StockTransactionReferenceType, required: true })
  reference_type: StockTransactionReferenceType;

  @Prop({ type: Types.ObjectId })
  reference_id?: Types.ObjectId;

  @Prop({ required: true })
  current_stock: number; // tồn kho sau thay đổi
}

export type StockTransactionDocument = HydratedDocument<StockTransaction>;
export const StockTransactionSchema =
  SchemaFactory.createForClass(StockTransaction);
