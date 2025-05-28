import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsMongoId,
  IsString,
  MaxLength,
  ValidateIf,
  IsObject,
  IsArray,
} from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100, { message: "Tên danh mục không được vượt quá 100 ký tự." })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId({ message: "parentId phải là ObjectId hợp lệ." })
  parentId?: string;

  @ApiProperty({
    description: "Các thuộc tính của biến thể sản phẩm dưới dạng key-value",
    required: false,
    nullable: true,
    example: { barre_material: "", country_of_origin: "" },
  })
  @IsOptional()
  @ValidateIf((o) => o.attributes !== null)
  @IsObject()
  attributes?: Record<string, string> | null;

  @ApiProperty({
    description: "Danh sách ObjectId của các danh mục",
    type: [String],
    example: ["60b8d295f8d2f814c89e6b8a"],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Type(() => String)
  brands?: string[];
}
