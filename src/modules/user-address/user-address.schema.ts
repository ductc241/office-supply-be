import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  collection: "user-addresses",
  timestamps: true,
})
export class UserAddress {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop()
  label: string;

  @Prop()
  recipientName: string;

  @Prop()
  phone: string;

  @Prop()
  addressLine: string;

  @Prop()
  ward: string;

  @Prop()
  district: string;

  @Prop()
  city: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export type UserAddressDocument = HydratedDocument<UserAddress>;
export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
