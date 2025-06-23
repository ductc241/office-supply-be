import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ default: false })
  should_track_low_stock: boolean;

  @Prop({ default: 0 })
  low_stock_threshold?: number;

  @Prop({ default: 0 })
  early_warning_buffer?: number;
}

export type InventoryDocument = HydratedDocument<Inventory>;
export const InventorySchema = SchemaFactory.createForClass(Inventory);
