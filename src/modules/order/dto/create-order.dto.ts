import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { OrderPaymentType } from "../types/order.enum";

export class OrderItemInputDto {
  @ApiProperty()
  @IsMongoId()
  variant: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address_line_1: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address_line_2?: string;

  @ApiProperty()
  @IsString()
  postal_code: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: "Danh sách các sản phẩm trong đơn hàng",
    type: [OrderItemInputDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  coupon?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address: ShippingAddressDto;

  @ApiProperty()
  @IsNumber()
  shipping_fee: number;

  @ApiProperty({ default: OrderPaymentType.COD })
  @IsEnum(OrderPaymentType)
  payment_method: OrderPaymentType;

  @ApiProperty()
  @IsString()
  shipping_method: string;
}
