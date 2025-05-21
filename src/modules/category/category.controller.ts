import { Body, Controller, Get, Post } from "@nestjs/common";
import { CategoryService } from "./category.service";

import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller("categories")
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    // private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  // @Get("query")
  // @ApiOperation({
  //   description: "to get brands",
  //   operationId: "queryBrands",
  // })
  // @ApiPagination()
  // async query(
  //   @Query() query: QueryBrandDto,
  //   @Pagination() pagination: IPagination,
  // ) {
  //   console.log(pagination);
  //   return await this.brandService.query(query, pagination);
  // }

  // @Get(":id")
  @Get()
  findOne() {
    return this.categoryService.query();
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateBrandDto: UpdateBrandDto) {
  //   return this.brandService.update(id, updateBrandDto);
  // }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.brandService.remove(id);
  // }
}
