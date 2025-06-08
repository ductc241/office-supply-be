import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateUserAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address_line_1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address_line_2: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}
