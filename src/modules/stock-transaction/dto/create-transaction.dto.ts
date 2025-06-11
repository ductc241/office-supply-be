import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNumber, IsOptional, Min } from "class-validator";
import {
  StockTransactionReferenceType,
  StockTransactionType,
} from "../types/stock-transaction.enum";

export class CreateStockTransactionDto {
  @ApiProperty()
  @IsMongoId()
  variant_id: string;

  @ApiProperty()
  @IsMongoId()
  warehouse_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsEnum(StockTransactionType)
  type: StockTransactionType;

  @ApiProperty()
  @IsOptional()
  note?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(StockTransactionReferenceType)
  reference_type?: StockTransactionReferenceType;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  reference_id?: string;
}
