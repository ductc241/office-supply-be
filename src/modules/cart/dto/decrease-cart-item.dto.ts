import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, Min } from "class-validator";

export class DecreaseCartItemDto {
  @ApiProperty({ example: "" })
  @IsMongoId()
  @IsNotEmpty()
  variant_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
