import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";

export class SummaryOrderDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo user ID",
    example: "",
  })
  @IsMongoId()
  @IsOptional()
  userId?: string;

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
