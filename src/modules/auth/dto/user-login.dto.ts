// dto/login.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class UserLoginDto {
  @ApiProperty({ example: "tacongduc123@gmail.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "tacongduc123" })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
