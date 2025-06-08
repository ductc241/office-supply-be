import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAddressRepository } from "./user-address.repository";
import { UserAddress, UserAddressSchema } from "./user-address.schema";
import { UserAddressService } from "./user-address.service";
import { UserAddressController } from "./user-address.controller";

@Module({
  providers: [UserAddressRepository, UserAddressService],
  controllers: [UserAddressController],
  imports: [
    MongooseModule.forFeature([
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
  ],
})
export class UserAddressModule {}
