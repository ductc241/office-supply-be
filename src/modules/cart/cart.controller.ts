import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";

import { CartService } from "./cart.service";
import { User } from "src/shared/decorator/current-user.decorator";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { DecreaseCartItemDto } from "./dto/decrease-cart-item.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async get(@User() user) {
    return await this.cartService.get(user.sub);
  }

  @Patch("clear")
  clearCart(@User() user: any) {
    return this.cartService.clear(user.sub);
  }

  @Post("items/increase")
  async add(@User() user, @Body() dto: AddCartItemDto) {
    return await this.cartService.increase(user.sub, dto);
  }

  @Put("items/decrease")
  async decrease(@User() user, @Body() dto: DecreaseCartItemDto) {
    return await this.cartService.decrease(user.sub, dto);
  }
}
