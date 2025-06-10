import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class AddViewHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
}
