import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Warehouse", required: true })
  warehouse: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: false })
  should_track_low_stock: boolean;

  @Prop({ default: 0 })
  low_stock_threshold?: number;
}

export type InventoryDocument = HydratedDocument<Inventory>;
export const InventorySchema = SchemaFactory.createForClass(Inventory);
