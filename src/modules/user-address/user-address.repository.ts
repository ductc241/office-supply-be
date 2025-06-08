import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/mongo";
import { UserAddress, UserAddressDocument } from "./user-address.schema";

@Injectable()
export class UserAddressRepository
  extends BaseRepository<UserAddressDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(UserAddress.name) model: Model<UserAddressDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
