import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CouponScope, CouponType } from "./types/coupon.enum";

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, enum: CouponScope })
  scope: CouponScope;

  @Prop({ required: true, enum: CouponType })
  discount_type: CouponType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  max_discount: number; // tổng tiền được giảm tối đa

  @Prop({ default: 0 })
  min_order_value: number; // giá trị đơn hàng tối thiểu để dùng coupon

  @Prop({ required: true })
  usage_limit: number; // số lần dùng tối đa

  @Prop({ required: true, default: 1 })
  user_limit: number; // số lần dùng tối đa trên một user

  @Prop({ default: 0 })
  used: number; // số lần đã sử dụng

  @Prop({ required: true })
  valid_from: Date;

  @Prop({ required: true })
  valid_until: Date;

  @Prop({ type: [String], default: null })
  applicable_product_ids: string[] | null;

  @Prop({ type: [String], default: null })
  applicable_category_ids: string[] | null;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  combinable: boolean;
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);
