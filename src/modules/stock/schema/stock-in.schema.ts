import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

class StockInItem {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ default: null })
  cost_price: number;
}

@Schema({ collection: "stock-ins", timestamps: true })
export class StockIn {
  @Prop({ default: null })
  note?: string;

  @Prop({
    type: [StockInItem],
    required: true,
  })
  items: StockInItem[];
}

export type StockInDocument = HydratedDocument<StockIn>;
export const StockInSchema = SchemaFactory.createForClass(StockIn);
