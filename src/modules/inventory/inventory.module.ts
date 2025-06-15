import { Module } from "@nestjs/common";
import { InventoryRepository } from "./inventory.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Inventory, InventorySchema } from "./inventory.schema";
import { InventoryService } from "./inventory.service";
import { ProductVariantModule } from "../product-variant/product-variant.module";
import { SocketModule } from "../socket/socket.module";
import { MailModule } from "../mail/mail.module";

@Module({
  providers: [InventoryRepository, InventoryService],
  controllers: [],
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
    ProductVariantModule,
    SocketModule,
    MailModule,
  ],
  exports: [InventoryRepository, InventoryService],
})
export class InventoryModule {}
