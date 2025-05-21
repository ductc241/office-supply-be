import { IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class BaseQueryDto {
  @ApiPropertyOptional({ description: "Trang hiện tại", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Số lượng sản phẩm mỗi trang",
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number = 10;
}
