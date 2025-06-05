import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { User } from "src/shared/decorator/current-user.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("coupon")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return await this.couponService.createCoupon(dto);
  }

  @Get("/get-available-coupon")
  async getAvailableCouponsForUser(@User() user) {
    return await this.couponService.getAvailableCouponsForUser(user.sub);
  }
}
