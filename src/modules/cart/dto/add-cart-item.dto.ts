import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNumber, Min } from "class-validator";

export class AddCartItemDto {
  @ApiProperty()
  @IsMongoId()
  variant_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
