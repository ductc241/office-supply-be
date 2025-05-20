import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsMongoId, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100, { message: "Tên danh mục không được vượt quá 100 ký tự." })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId({ message: "parentId phải là ObjectId hợp lệ." })
  parentId?: string;
}
