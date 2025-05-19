import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CartItem, CartItemSchema } from "./cart-item.schema";

@Module({
  // providers: [CartItemService],
  // controllers: [CartItemController],
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
    ]),
  ],
})
export class CartItemModule {}
