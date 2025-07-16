import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsString,
  IsNumber,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  last_password: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(["male", "female", "other"])
  gender?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  total_order?: number;

  @IsOptional()
  @IsNumber()
  total_shopping_amount?: number;

  @IsOptional()
  @IsEnum(["customer", "admin"])
  user_type?: string;

  @IsOptional()
  @IsDateString()
  last_login_at?: Date;
}
