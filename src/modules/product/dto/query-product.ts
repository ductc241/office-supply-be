import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";
import { ProductFilter } from "../types/product.enum";

export class QueryProductsDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Từ khóa tìm kiếm theo tên sản phẩm",
    example: "",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Danh sách categoryId cần lọc",
    type: [String],
    example: [""],
  })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : typeof value === "string" ? [value] : [],
  )
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: "Giá thấp nhất", example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Giá cao nhất" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Thuộc tính chung của sản phẩm",
    example: { barre_material: [""], country_of_origin: [""] },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, string[]>;

  @ApiPropertyOptional({
    type: String,
    enum: ProductFilter,
    description: "Sắp xếp",
  })
  @IsOptional()
  @IsEnum(ProductFilter)
  sort?: ProductFilter;
}
