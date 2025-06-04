import { IsEnum, IsString } from "class-validator";
import { OrderStatus } from "../types/order.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateOrderStatusDto {
  @ApiProperty({ example: OrderStatus.PAID })
  @IsString()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
