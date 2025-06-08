import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { User } from "src/shared/decorator/current-user.decorator";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { ApplyCouponDto } from "./dto/apply-coupon";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("coupon")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return await this.couponService.createCoupon(dto);
  }

  @Get("/get-detail/:couponId")
  async get(@Param("couponId") couponId: string) {
    return await this.couponService.getCouponDetail(couponId);
  }

  @ApiOperation({ summary: "web - get available coupons for users" })
  @Get("/get-available-coupon")
  async getAvailableCouponsForUser(@User() user) {
    return await this.couponService.getAvailableCouponsForUser(user.sub);
  }

  @ApiOperation({ summary: "web - get appliable coupons for users't cart" })
  @Get("/get-appliable-coupon")
  async getAppliableCouponsForUser(@User() user) {
    return await this.couponService.getAppliableCouponsForUserCart(user.sub);
  }

  @ApiOperation({ summary: "web - apply coupon for users't cart" })
  @Post("/apply-coupon")
  async applyCouponForCart(@User() user, @Body() dto: ApplyCouponDto) {
    return await this.couponService.applyCouponForCart(user.sub, dto.coupon_id);
  }
}
