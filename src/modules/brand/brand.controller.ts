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

import { ApiOperation } from "@nestjs/swagger";
import { QueryBrandDto } from "./dto/query-brand.dto";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";
import { Pagination } from "src/shared/pagination/pagination.decorator";
import {
  ApiPagination,
  IPagination,
} from "src/shared/pagination/pagination.interface";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";

@Controller("brand")
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get("query")
  @ApiOperation({
    description: "to get brands",
    operationId: "queryBrands",
  })
  @ApiPagination()
  async query(
    @Query() query: QueryBrandDto,
    @Pagination() pagination: IPagination,
  ) {
    console.log(pagination);
    return await this.brandService.query(query, pagination);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.brandService.remove(id);
  }
}
