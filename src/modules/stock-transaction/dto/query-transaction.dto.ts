import { IsEnum, IsOptional, IsString, IsDateString } from "class-validator";
import { StockTransactionType } from "../types/stock-transaction.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryDto } from "src/shared/pagination/pagination.dto";

export class QueryStockTransactionDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({
    type: String,
    enum: StockTransactionType,
    example: StockTransactionType.IMPORT,
  })
  @IsOptional()
  @IsEnum(StockTransactionType)
  type?: StockTransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string; // ISO 8601 string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string; // ISO 8601 string
}
