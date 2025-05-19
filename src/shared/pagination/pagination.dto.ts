import { IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class BaseQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number = 10;
}
