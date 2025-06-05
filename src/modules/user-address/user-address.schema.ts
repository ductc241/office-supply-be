import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  collection: "user-addresses",
  timestamps: true,
})
export class UserAddress {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop()
  label: string;

  @Prop()
  fullname: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address_line_1: string;

  @Prop()
  address_line_2: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export type UserAddressDocument = HydratedDocument<UserAddress>;
export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
