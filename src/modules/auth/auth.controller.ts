import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserLoginDto } from "./dto/user-login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: UserRegisterDto) {
    return await this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: UserLoginDto) {
    return await this.authService.login(dto);
  }
}
