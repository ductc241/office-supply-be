import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class QueryProductOptionDto {
  @ApiPropertyOptional({
    description: "Từ khóa tìm kiếm theo tên sản phẩm",
    example: "",
  })
  @IsOptional()
  @IsString()
  name?: string;
}
