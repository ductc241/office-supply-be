import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreateProductVariantDto } from "src/modules/product-variant/dto/create-product-variant.dto";

class CreateProductDto {
  @ApiProperty({ example: "T-Shirt", description: "Tên sản phẩm" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: "Áo thun cotton cao cấp",
    description: "Mô tả ngắn gọn về sản phẩm",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "665a9bc71c34a31d8ff8eabc",
    description: "ID của category cấp 2",
  })
  @IsMongoId()
  category: string;

  @ApiProperty({
    example: "664a1fd81c34a31d8ff8e111",
    description: "ID của thương hiệu (brand)",
  })
  @IsMongoId()
  brand: string;
}

export class CreateFullProductDto {
  @ApiProperty({
    type: () => CreateProductDto,
    description: "Thông tin sản phẩm",
  })
  @ValidateNested()
  @Type(() => CreateProductDto)
  product: CreateProductDto;

  @ApiProperty({
    type: [CreateProductVariantDto],
    description: "Danh sách các biến thể sản phẩm",
  })
  @IsArray()
  @ArrayMinSize(1, { message: "Sản phẩm phải có ít nhất một biến thể." })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
