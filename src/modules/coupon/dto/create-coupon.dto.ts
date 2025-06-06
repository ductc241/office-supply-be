import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { CouponScope, CouponType } from "../types/coupon.enum";
import { Type } from "class-transformer";

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  @MaxLength(10, { message: "Code không được vượt quá 10 ký tự." })
  code: string;

  @ApiProperty({ example: "Coupon for special event" })
  @IsString()
  label: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_preview?: string;

  @ApiProperty({ example: CouponScope.ORDER })
  @IsEnum(CouponScope)
  scope: CouponScope;

  @ApiProperty({ example: CouponType.PERCENT })
  @IsEnum(CouponType)
  discount_type: CouponType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_order_value?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  usage_limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  user_limit?: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  valid_from: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  valid_until: Date;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicable_product_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicable_category_ids?: string[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  combinable?: boolean;
}
