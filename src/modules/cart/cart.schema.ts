import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { CartItem } from "../cart-item/cart-item.schema";

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({
    type: String,
    default: "active",
    enum: ["active", "abandoned", "converted"],
  })
  status: string;

  @Prop()
  lastUpdated: Date;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
