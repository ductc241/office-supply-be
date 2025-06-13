// dto/create-product-variant.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  ValidateIf,
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

  // @ApiProperty({
  //   example: { color: "red", size: "M" },
  //   description: "Tổ hợp thuộc tính (màu sắc, kích cỡ, v.v.)",
  // })
  // @IsObject()
  // @IsNotEmpty()
  // attributes: Record<string, string>;
  @ApiProperty({
    description: "Các thuộc tính của biến thể sản phẩm dưới dạng key-value",
    required: false,
    nullable: true,
    example: { color: "red", size: "L" },
  })
  @IsOptional()
  @ValidateIf((o) => o.attributes !== null)
  @IsObject()
  attributes?: Record<string, string> | null;

  @ApiProperty({ example: 199000 })
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

  @ApiPropertyOptional({ example: 199000, description: "Giá nhập" })
  @IsOptional()
  @IsNumber()
  cost_price?: number; // có nếu có tồn kho ban đầu

  @ApiPropertyOptional({ example: 10, description: "Số lượng tồn kho ban đầu" })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
