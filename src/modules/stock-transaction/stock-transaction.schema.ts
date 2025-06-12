import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { StockTransactionType } from "./types/stock-transaction.enum";

@Schema({ collection: "stock-transactions", timestamps: true })
export class StockTransaction {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ required: true })
  quantity: number; // âm nếu xuất kho

  @Prop({ required: true })
  quantity_before: number;

  @Prop({ required: true })
  quantity_after: number;

  @Prop({ required: true })
  cost_price: number;

  @Prop({ default: null })
  average_cost_price_before?: number; // t.tin bổ sung, chỉ thay đổi khi nhập hàng

  @Prop({ default: null })
  average_cost_price_after?: number; // t.tin bổ sung, chỉ thay đổi khi nhập hàng

  @Prop({ enum: StockTransactionType, required: true })
  type: StockTransactionType;

  @Prop({ type: Types.ObjectId })
  reference_id?: Types.ObjectId;

  @Prop()
  note?: string; // ví dụ: "Order #1234", "Manual adjust", ...
}

export type StockTransactionDocument = HydratedDocument<StockTransaction>;
export const StockTransactionSchema =
  SchemaFactory.createForClass(StockTransaction);
