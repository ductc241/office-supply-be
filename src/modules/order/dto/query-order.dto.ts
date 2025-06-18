import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";
import { OrderStatus } from "../types/order.enum";

export class QueryOrderDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo ID đơn hàng",
    example: "",
  })
  @IsMongoId()
  @IsOptional()
  order_id?: string;

  @ApiPropertyOptional({
    type: String,
    enum: OrderStatus,
    description: "Tìm kiểm theo trạng thái đơn hàng",
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "Tìm kiếm ngày",
    example: "2025-01-01",
  })
  @IsOptional()
  from_date?: string;

  @ApiPropertyOptional({
    description: "Tìm kiếm ngày",
    example: "2025-12-31",
  })
  @IsOptional()
  to_date?: string;
}
