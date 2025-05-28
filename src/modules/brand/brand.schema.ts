import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: null })
  logo?: string | null;

  @Prop({ type: [Types.ObjectId], ref: "Brand", default: [] })
  categories: Types.ObjectId[];
}

export type BrandDocument = HydratedDocument<Brand>;
export const BrandSchema = SchemaFactory.createForClass(Brand);
