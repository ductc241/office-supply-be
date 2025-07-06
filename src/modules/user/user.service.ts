// user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { QueryOptions, Types } from "mongoose";
import * as bcrypt from "bcryptjs";

import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import ERROR_MESSAGE from "src/shared/constants/error";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ProductService } from "../product/product.services";
import { IPagination } from "src/shared/pagination/pagination.interface";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { QueryUserDto } from "./dto/query-user.dto";
import { replaceQuerySearch } from "src/shared/helpers/common";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async query(pagination: IPagination, query: QueryUserDto) {
    let conditions: Record<string, any> = {
      user_type: "customer",
    };
    let options: QueryOptions = {
      projection: {
        password: 0,
        last_password: 0,
        product_favourites: 0,
        view_history: 0,
        user_type: 0,
        note: 0,
      },
      sort: { createdAt: -1 },
    };

    if (query.full_name) {
      conditions = {
        ...conditions,
        full_name: {
          $regex: replaceQuerySearch(query.full_name),
          $options: "i",
        },
      };
    }

    if (query.user_id) {
      conditions = {
        ...conditions,
        _id: new Types.ObjectId(query.user_id),
      };
    }

    if (query.active) {
      conditions = {
        ...conditions,
        is_active: query.active === "true",
      };
    }

    if (pagination) {
      options = {
        ...options,
        limit: pagination.perPage,
        skip: pagination.startIndex,
      };
    }

    const [result, totalCount] = await Promise.all([
      this.userRepository.find(conditions, options),
      this.userRepository.count(conditions),
    ]);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      totalCount ?? 0,
    );

    return {
      items: result,
      headers: responseHeaders,
    };
  }

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
    const user = await this.userRepository.updateById(id, updateUserDto);
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
    await this.userRepository.updateById(userId, {
      $pull: { view_history: new Types.ObjectId(productId) },
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
