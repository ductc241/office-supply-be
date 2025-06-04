import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";

import { OrderService } from "./order.service";
import { User } from "src/shared/decorator/current-user.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-status-order.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@User() user, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(user.sub, dto);
  }

  @Get("get-orders")
  async getOrdersForUser(@User() user) {
    return await this.orderService.getOrdersForUser(user.sub);
  }

  @Get("get-detail/:orderId")
  async getDetail(@User() user, @Param("orderId") orderId: string) {
    return await this.orderService.getOrderDetail(user.sub, orderId);
  }

  @ApiOperation({
    summary: "cms - update order status",
    description: "paid, shipping, delivered, cancelled, refunded",
  })
  @Patch("update-status/:orderId")
  async updateStatus(
    @Body() dto: UpdateOrderStatusDto,
    @Param("orderId") orderId: string,
  ) {
    return await this.orderService.updateStatus(orderId, dto);
  }
}
