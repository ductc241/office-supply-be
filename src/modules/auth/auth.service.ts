import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../user/user.service";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserLoginDto } from "./dto/user-login.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDto) {
    const existing = await this.userService.findOne({ email: dto.email });
    if (existing)
      throw new BadRequestException("The email address is already in use");

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.userService.create({
      ...dto,
      password: hashedPassword,
      last_password: hashedPassword,
    });

    return { status: "success", message: "User registered successfully" };
  }

  async login(dto: UserLoginDto) {
    const user = await this.userService.findOne({ email: dto.email });
    if (!user) throw new BadRequestException("Email không tồn tại");

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException("Sai mật khẩu");

    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
