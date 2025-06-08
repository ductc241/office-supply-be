import { Injectable, NotFoundException } from "@nestjs/common";
import { UserAddressRepository } from "./user-address.repository";
import { CreateUserAddressDto } from "./dto/create-user-address.dto";
import { UpdateUserAddressDto } from "./dto/update-user.address.dto";

@Injectable()
export class UserAddressService {
  constructor(private readonly userAddressRepository: UserAddressRepository) {}

  async create(userId: string, dto: CreateUserAddressDto) {
    if (dto.isDefault) {
      await this.userAddressRepository.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false },
      );
    }

    return this.userAddressRepository.create({
      ...dto,
      user: userId,
    });
  }

  async getAddressesForUser(userId: string) {
    return this.userAddressRepository.find({ user: userId });
  }

  async findOne(userId: string, id: string) {
    const address = await this.userAddressRepository.findOne({
      _id: id,
      user: userId,
    });
    if (!address) {
      throw new NotFoundException("Address not found");
    }
    return address;
  }

  async update(userId: string, id: string, dto: UpdateUserAddressDto) {
    if (dto.isDefault) {
      await this.userAddressRepository.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false },
      );
    }

    const updated = await this.userAddressRepository.updateOne(
      { _id: id, user: userId },
      dto,
    );

    if (!updated) {
      throw new NotFoundException("Address not found");
    }

    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.userAddressRepository.deleteOne({
      _id: id,
      user: userId,
    });
    if (!result) {
      throw new NotFoundException("Address not found");
    }
  }

  async setDefault(userId: string, id: string) {
    const address = await this.userAddressRepository.findOne({
      _id: id,
      user: userId,
    });
    if (!address) {
      throw new NotFoundException("Address not found");
    }

    await this.userAddressRepository.updateMany(
      { user: userId, isDefault: true },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.userAddressRepository.save(address);
  }
}
