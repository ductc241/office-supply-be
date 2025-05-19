import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  lastPassword: string;

  @Prop()
  fullName: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ enum: ["male", "female", "other"], default: "other" })
  gender: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number })
  totalOrder: number;

  @Prop({ type: Number })
  totalShoppingAmount: number;

  @Prop({ enum: ["customer", "admin"], default: "customer" })
  userType: string;

  @Prop({ type: Date })
  lastLoginAt: Date;

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
