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

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
