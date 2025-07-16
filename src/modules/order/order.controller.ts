import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";

import { OrderService } from "./order.service";
import { User } from "src/shared/decorator/current-user.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-status-order.dto";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { Pagination } from "src/shared/pagination/pagination.decorator";
import { QueryOrderDto } from "./dto/query-order.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get("query")
  @ApiPagination()
  async getAll(
    @Pagination() pagination: IPagination,
    @Query() query: QueryOrderDto,
  ) {
    return await this.orderService.query(pagination, query);
  }

  @Post()
  async create(@User() user, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(user.sub, dto);
  }

  @Get("get-orders")
  async getOrdersForUser(@User() user) {
    return await this.orderService.getOrdersForUser(user.sub);
  }

  @Get("get-orders/product/:productId")
  async getOrdersByProduct(@Param("productId") productId: string) {
    return this.orderService.getOrdersByProductId(productId);
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

  @ApiOperation({
    summary: "user - update order status",
    description: "paid, shipping, delivered, cancelled, refunded",
  })
  @Patch("cancel/:orderId")
  async cancelOrder(@User() user, @Param("orderId") orderId: string) {
    return await this.orderService.cancelOrder(orderId, user.sub);
  }

  @ApiOperation({
    summary: "cms - update order status",
    description: "paid, shipping, delivered, cancelled, refunded",
  })
  @Patch("admin/cancel/:orderId")
  async adminCancelOrder(@Param("orderId") orderId: string) {
    return await this.orderService.adminCancelOrder(orderId);
  }
}
