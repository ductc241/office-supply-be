import { IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  current_password: string;

  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @IsNotEmpty()
  confirm_new_password: string;
}
