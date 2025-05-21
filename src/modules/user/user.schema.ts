import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

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
  full_name?: string | null;

  @Prop({ default: null })
  date_of_birth: Date | null;

  @Prop({ enum: ["male", "female", "other"], default: "other" })
  gender: string;

  @Prop({ default: null })
  avatar_url: string | null;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Number, default: 0 })
  total_order: number;

  @Prop({ type: Number, default: 0 })
  total_shopping_amount: number;

  @Prop({ enum: ["customer", "admin"], default: "customer" })
  user_type: string;

  @Prop({ type: Date })
  last_login_at: Date;

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
