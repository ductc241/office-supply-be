import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  collection: "product-variants",
  timestamps: true,
})
export class ProductVariant {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId;

  @Prop({ unique: true, required: true })
  sku: string;

  @Prop({ type: Map, of: String })
  attributes: Map<string, string>;

  @Prop({ type: Number, required: true, default: 0 })
  stock: number;

  @Prop({ type: Number, required: true })
  base_price: number;

  @Prop({ type: Number, default: null })
  min_price: number;

  @Prop({ type: Number, default: null })
  max_price: number;

  @Prop({ type: Number, default: null })
  last_cost_price: number;

  @Prop({ type: Number, default: null })
  average_cost_price: number;
}

export type ProductVariantDocument = HydratedDocument<ProductVariant>;
export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
