import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: null })
  logo?: string | null;
}

export type BrandDocument = HydratedDocument<Brand>;
export const BrandSchema = SchemaFactory.createForClass(Brand);
