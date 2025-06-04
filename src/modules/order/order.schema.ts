import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { OrderPaymentType, OrderStatus } from "./types/order.enum";
@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ProductVariant", required: true })
  variant: Types.ObjectId;

  @Prop({ require: true })
  sku: string;

  @Prop({ type: Map, of: String })
  attributes: Map<string, string>;

  @Prop({ require: true })
  quantity: number;

  @Prop({ require: true })
  cost_price_at_time: number; // Giá vốn tại thời điểm mua

  @Prop({ require: true })
  base_price: number; // giá bán gốc

  @Prop({ default: 0 })
  discount_from_coupon?: number; // tổng giảm được từ coupon

  @Prop({ require: true })
  price: number; // Giá bán thực tế (có thể giảm nếu áp dụng coupon)

  @Prop({ default: false })
  is_coupon_applied?: boolean; // Áp dụng đối với product coupon
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: "Coupon", default: null })
  coupon?: Types.ObjectId; // Có thể thêm scope để không cần populate

  @Prop({ require: true })
  subtotal: number; // Tổng tiền trước khi giảm giá

  @Prop({ default: 0 })
  discount: number; // Tổng tiền được giảm từ coupon

  @Prop({ default: 0 })
  shipping_fee?: number;

  @Prop({ require: true })
  total: number; // Tổng tiền người dùng phải trả

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ enum: OrderPaymentType, require: true })
  payment_method: OrderPaymentType;

  @Prop({ require: true })
  shipping_method: string;

  @Prop({ default: null })
  paid_at?: Date;

  @Prop({ default: null })
  shipped_at?: Date;

  @Prop({ default: null })
  completed_at?: Date;

  @Prop({ default: null })
  cancelled_at?: Date;

  @Prop({ default: null })
  refunded_at?: Date;

  @Prop({
    type: {
      full_name: String,
      phone: String,
      address_line_1: String,
      address_line_2: String,
      postal_code: String,
    },
    required: true,
    _id: false,
  })
  shipping_address: any;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
