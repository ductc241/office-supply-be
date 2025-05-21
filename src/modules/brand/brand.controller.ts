import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { BrandService } from "./brand.service";

import { QueryBrandDto } from "./dto/query-brand.dto";
import { Pagination } from "src/shared/pagination/pagination.decorator";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";

@Controller("brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @Get("query")
  @ApiPagination()
  async query(
    @Query() query: QueryBrandDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.brandService.query(query, pagination);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return await this.brandService.findById(id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.brandService.remove(id);
  }
}
