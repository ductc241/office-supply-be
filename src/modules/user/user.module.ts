import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ProductModule } from "../product/product.module";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";

@Module({
  providers: [UserRepository, UserService, PaginationHeaderHelper],
  controllers: [UserController],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProductModule,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
