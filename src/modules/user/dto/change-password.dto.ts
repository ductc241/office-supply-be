import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ example: "" })
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ example: "" })
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty({ example: "" })
  @IsNotEmpty()
  confirm_new_password: string;
}
