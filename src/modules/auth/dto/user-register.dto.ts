import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UserRegisterDto {
  @ApiProperty({ example: "" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "" })
  @IsNotEmpty()
  password: string;
}
