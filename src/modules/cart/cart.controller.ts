import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiParam } from "@nestjs/swagger";

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

  @Post("items")
  async add(@User() user, @Body() dto: AddCartItemDto) {
    return await this.cartService.add(user.sub, dto);
  }

  @Put("items/:id")
  @ApiParam({
    name: "id",
    required: true,
    type: String,
  })
  async decrease(
    @User() user,
    @Param("id") id: string,
    @Body() dto: DecreaseCartItemDto,
  ) {
    return await this.cartService.decrease(user.sub, id, dto);
  }
}
