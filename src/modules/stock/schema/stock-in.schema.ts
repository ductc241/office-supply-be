import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class StockIn {
  @Prop({ type: Types.ObjectId, ref: "Warehouse", required: true })
  warehouse: Types.ObjectId;

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
        cost_price: { type: Number }, // Giá nhập
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
