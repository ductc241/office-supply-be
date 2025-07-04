import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";

export class QueryInventoryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo ID đơn hàng",
    example: "",
  })
  @IsMongoId()
  @IsOptional()
  product_id?: string;
}
