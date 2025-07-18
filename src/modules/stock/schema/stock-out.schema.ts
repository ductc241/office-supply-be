import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ collection: "stock-outs", timestamps: true })
export class StockOut {
  @Prop({ default: null })
  note?: string;

  @Prop({
    type: [
      {
        variant: {
          type: Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        quantity: { type: Number, required: true },
        cost_price: { type: Number },
      },
    ],
    required: true,
  })
  items: Array<{
    variant: Types.ObjectId;
    quantity: number;
    cost_price?: number;
  }>;
}

export type StockOutDocument = HydratedDocument<StockOut>;
export const StockOutSchema = SchemaFactory.createForClass(StockOut);
