import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class Warehouse {
  @Prop({ required: true })
  name: string;

  @Prop()
  address?: string;

  @Prop()
  code?: string;

  @Prop({ default: true })
  is_active: boolean;
}

export type WarehouseDocument = HydratedDocument<Warehouse>;
export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
