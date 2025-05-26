import { IsIn, IsString } from "class-validator";

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(["paid", "shipping", "delivered", "cancelled"])
  status: string;
}
