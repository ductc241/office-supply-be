// user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import * as bcrypt from "bcryptjs";

import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import ERROR_MESSAGE from "src/shared/constants/error";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ProductService } from "../product/product.services";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(new Types.ObjectId(id));
    if (!user) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return user;
  }

  async findOne(query: any) {
    const user = await this.userRepository.findOne(query);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.updateById(
      new Types.ObjectId(id),
      updateUserDto,
    );
    if (!user) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return user;
  }

  async remove(id: string) {
    const user = await this.userRepository.deleteById(new Types.ObjectId(id));
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { current_password, new_password, confirm_new_password } = dto;

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Mật khẩu hiện tại không đúng");
    }

    if (new_password !== confirm_new_password) {
      throw new BadRequestException("Xác nhận mật khẩu không khớp");
    }

    const isSameAsLastPassword = await bcrypt.compare(
      new_password,
      user.last_password,
    );
    if (isSameAsLastPassword) {
      throw new BadRequestException(
        "Mật khẩu mới không được trùng với mật khẩu cũ",
      );
    }

    const hashed = await bcrypt.hash(new_password, 10);
    user.password = hashed;
    user.last_password = hashed;

    await this.userRepository.save(user);

    return { message: "Đổi mật khẩu thành công" };
  }

  async addProductToFavourites(userId: string, productId: string) {
    await this.userRepository.updateById(userId, {
      $addToSet: { productFavourites: productId },
    });
  }

  async removeProductFromFavourites(userId: string, productId: string) {
    await this.userRepository.updateById(userId, {
      $pull: { productFavourites: productId },
    });
  }

  async getFavouriteProducts(userId: string) {
    const user = await this.userRepository.findById(userId, {
      projection: {
        product_favourites: 1,
      },
    });

    return user?.product_favourites || [];
  }

  async addProductToViewHistory(userId: string, productId: string) {
    console.log(productId);
    await this.userRepository.updateById(userId, {
      $pull: { view_history: productId },
    });

    await this.userRepository.updateById(userId, {
      $push: {
        view_history: {
          $each: [productId],
          $position: 0,
        },
      },
    });
  }

  async getUserViewHistory(userId: string, limit = 20) {
    const user = await this.userRepository.findById(userId, {
      projection: {
        view_history: 1,
      },
      limit,
    });

    if (user?.view_history.length === 0) return [];

    const productIds = user.view_history.map((id) => id.toString());
    return this.productService.query({ productIds, perPage: limit });
  }
}
