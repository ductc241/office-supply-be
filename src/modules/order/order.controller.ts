import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";

import { OrderService } from "./order.service";
import { User } from "src/shared/decorator/current-user.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@User() user, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(user.sub, dto);
  }
}
