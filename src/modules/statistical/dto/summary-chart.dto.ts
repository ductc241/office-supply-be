import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import { SummaryGroup } from "../type/inde";

export class SummaryChartDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo user ID",
    example: "",
  })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    type: String,
    enum: SummaryGroup,
    description: "Tìm kiểm theo trạng thái đơn hàng",
  })
  @IsOptional()
  @IsEnum(SummaryGroup)
  group_by?: SummaryGroup;

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
