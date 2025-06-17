import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBooleanString,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";

export class QueryUserDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo ID",
    example: "",
  })
  @IsMongoId()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: "Tìm kiếm theo tên",
    example: "",
  })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: "Tìm kiểm theo trạng thái user",
    default: true,
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;
}
