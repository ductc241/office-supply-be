import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  collection: "cart-items",
  timestamps: true,
})
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export type CartItemDocument = HydratedDocument<CartItem>;
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
