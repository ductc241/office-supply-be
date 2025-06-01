import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string | null;

  @Prop({ default: null })
  image_preview: string | null;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Object, default: {} })
  specifications?: Record<string, string>;

  @Prop({ type: Types.ObjectId, ref: "Category", required: true })
  category: Types.ObjectId; // category cuối

  @Prop({ type: [Types.ObjectId], ref: "Category", index: true })
  category_path: Types.ObjectId[]; // toàn bộ path (tương tự ancestors của category hiện tại)

  @Prop({ type: Types.ObjectId, ref: "Brand", required: true })
  brand: Types.ObjectId;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
