import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  last_password: string;

  @Prop({ default: null })
  full_name?: string;

  @Prop({ default: null })
  date_of_birth: Date;

  @Prop({ enum: ["male", "female", "other"], default: "other" })
  gender: string;

  @Prop({ default: null })
  avatar_url: string;

  @Prop({ type: Number, default: 0 })
  total_order: number;

  @Prop({ type: Number, default: 0 })
  total_shopping_amount: number;

  @Prop({ enum: ["customer", "admin"], default: "customer" })
  user_type: string;

  @Prop({ type: Date, default: null })
  last_login_at: Date;

  @Prop({ type: Types.ObjectId, ref: "Product", default: [] })
  product_favourites: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: "Product", default: [] })
  view_history: Types.ObjectId[];

  @Prop({ default: null })
  note: string;

  @Prop({ default: true })
  is_active: boolean;

  // @Prop({ enum: ["bronze", "silver", "gold", "platinum"], default: "bronze" })
  // loyaltyLevel: string;

  // @Prop({ default: 0 })
  // score: number;

  // @Prop()
  // referralCode: string;

  // @Prop({ type: Types.ObjectId, ref: "User", required: false })
  // referredBy: Types.ObjectId;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
