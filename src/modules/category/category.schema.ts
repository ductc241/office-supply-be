import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: "Category", default: null })
  parentId: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: "Category", default: [] })
  ancestors: Types.ObjectId[]; // all parent nodes from root to immediate parent

  @Prop({ type: Number, default: 0 })
  level: number;

  @Prop({ default: true })
  is_leaf: boolean; // để biết có category con không
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
