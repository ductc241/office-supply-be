// dto/create-product-variant.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from "class-validator";

export class CreateProductVariantDto {
  @ApiProperty({
    example: "665a9bc71c34a31d8ff8eabc",
    description: "ID của product (sẽ được tự gán khi tạo full product)",
    required: false,
  })
  @IsOptional() // Cho phép optional khi dùng trong CreateFullProductDto
  @IsMongoId()
  product?: string;

  @ApiProperty({
    example: "TS-RED-M",
    description: "SKU duy nhất cho biến thể",
  })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({
    example: { color: "red", size: "M" },
    description: "Tổ hợp thuộc tính (màu sắc, kích cỡ, v.v.)",
  })
  @IsObject()
  @IsNotEmpty()
  attributes: Record<string, string>;

  @ApiProperty({ example: 10, description: "Số lượng tồn kho" })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: 199000, description: "Giá gốc (base price)" })
  @IsNumber()
  base_price: number;

  @ApiProperty({ example: 189000, required: false })
  @IsOptional()
  @IsNumber()
  min_price?: number;

  @ApiProperty({ example: 209000, required: false })
  @IsOptional()
  @IsNumber()
  max_price?: number;

  @ApiProperty({ example: 150000, required: false })
  @IsOptional()
  @IsNumber()
  last_cost_price?: number;

  @ApiProperty({ example: 160000, required: false })
  @IsOptional()
  @IsNumber()
  average_cost_price?: number;
}
