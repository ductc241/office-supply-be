import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserAddressService } from "./user-address.service";
import { CreateUserAddressDto } from "./dto/create-user-address.dto";
import { User } from "src/shared/decorator/current-user.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { UpdateUserAddressDto } from "./dto/update-user.address.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("user-addresses")
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post()
  async create(@User() user, @Body() dto: CreateUserAddressDto) {
    return await this.userAddressService.create(user.sub, dto);
  }

  @Get()
  async getAddressesForUser(@User() user) {
    return await this.userAddressService.getAddressesForUser(user.sub);
  }

  @Get("get-detail/:addressId")
  async findOne(@User() user, @Param("addressId") addressId: string) {
    return await this.userAddressService.findOne(user.sub, addressId);
  }

  @Patch("update/:addressId")
  async update(
    @User() user,
    @Param("addressId") addressId: string,
    @Body() dto: UpdateUserAddressDto,
  ) {
    return await this.userAddressService.update(user.sub, addressId, dto);
  }
}
