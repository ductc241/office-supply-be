import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class ApplyCouponDto {
  @ApiProperty()
  @IsMongoId()
  coupon_id: string;
}
