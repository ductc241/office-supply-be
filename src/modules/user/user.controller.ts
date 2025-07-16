import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "src/shared/decorator/current-user.decorator";
import { AddViewHistoryDto } from "./dto/add-view-history.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { Pagination } from "src/shared/pagination/pagination.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("query")
  @ApiPagination()
  async query(
    @Pagination() pagination: IPagination,
    @Query() query: QueryUserDto,
  ) {
    return await this.userService.query(pagination, query);
  }

  @Patch("/update")
  async update(@Body() dto: UpdateUserDto, @Query("userId") userId?: string) {
    return await this.userService.update(userId, dto);
  }

  @Get("/get-favourite-products")
  async getFavouriteProducts(@User() user) {
    return await this.userService.getFavouriteProducts(user.sub);
  }

  @Get("/get-view-history")
  async getUserViewHistory(@User() user, @Query("limit") limit: string) {
    return await this.userService.getUserViewHistory(
      user.sub,
      Number(limit) ?? 10,
    );
  }

  @Patch("/add-view-history")
  async addProductToViewHistory(
    @User() user,
    @Body() params: AddViewHistoryDto,
  ) {
    return await this.userService.addProductToViewHistory(
      user.sub,
      params.product_id,
    );
  }

  @Patch("/add-favourite-products")
  async addProductToFavourites(
    @User() user,
    @Body() params: AddViewHistoryDto,
  ) {
    return await this.userService.addProductToFavourites(
      user.sub,
      params.product_id,
    );
  }

  @Patch("/change-password")
  async changePassword(@User() user, @Body() dto: ChangePasswordDto) {
    return await this.userService.changePassword(user.sub, dto);
  }

  @Get("/get-detail/:id")
  async findById(@Param("id") id: string) {
    return await this.userService.findById(id);
  }

  @Get("/get-profile")
  async getProfile(@User() user) {
    return await this.userService.getProfile(user.sub);
  }

  @Patch("/update-profile")
  async updateProfile(@User() user, @Body() dto: UpdateUserDto) {
    return await this.userService.update(user.sub, dto);
  }
}
