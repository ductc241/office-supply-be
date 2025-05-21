import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";

export class QueryProductsDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Từ khóa tìm kiếm theo tên sản phẩm",
    example: "nike",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Danh sách categoryId cần lọc",
    type: [String],
    example: ["665abc...", "665def..."],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: "Giá thấp nhất", example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Giá cao nhất", example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
