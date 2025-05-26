import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ collection: "coupon-usages", timestamps: true })
export class CouponUsage {
  @Prop({ type: Types.ObjectId, ref: "Coupon", required: true })
  coupon: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Order", required: true })
  order: Types.ObjectId;

  @Prop({ type: Number, required: true })
  discount_value: number;

  @Prop({
    type: String,
    enum: ["used", "cancelled", "refunded"],
    default: "used",
  })
  status: "used" | "cancelled" | "refunded";
  // cancelled - user có thể dùng lại được coupon - Xảy ra khi đơn chưa thanh toán, bị hủy → không giao hàng
  // refunded - user ko thể dùng lại đc coupon - Xảy ra khi đơn đã thanh toán, bị trả hàng → hoàn tiền

  @Prop({ default: null })
  used_at?: Date;

  @Prop({ default: null })
  cancelled_at?: Date;

  @Prop({ default: null })
  refunded_at?: Date;

  @Prop({ default: null })
  note?: string;
}

export type CouponUsageDocument = HydratedDocument<CouponUsage>;
export const CouponUsageSchema = SchemaFactory.createForClass(CouponUsage);
