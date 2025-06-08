import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  collection: "user-addresses",
  timestamps: true,
})
export class UserAddress {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address_line_1: string;

  @Prop({ required: true })
  address_line_2: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export type UserAddressDocument = HydratedDocument<UserAddress>;
export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
