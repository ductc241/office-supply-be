import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CategoryService } from "./category.service";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { ApiOperation } from "@nestjs/swagger";

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

  @Get()
  query() {
    return this.categoryService.query();
  }

  @Get("get-tree")
  @ApiOperation({
    summary: "web - get category list in tree form",
  })
  getTree() {
    return this.categoryService.getTree();
  }

  @Get("get-detail/:categoryId")
  @ApiOperation({
    summary: "web - get category detail with child categories",
  })
  getDetail(@Param("categoryId") categoryId: string) {
    return this.categoryService.getDetail(categoryId);
  }

  // @Get("get-child/:categoryId")
  // getChild(@Param("categoryId") categoryId: string) {
  //   return this.categoryService.getChild(categoryId);
  // }

  @Get("get-sibling/:categoryId")
  @ApiOperation({
    summary:
      "web - get the list of sibling categories that share the same parent.",
  })
  getSibling(@Param("categoryId") categoryId: string) {
    return this.categoryService.getSibling(categoryId);
  }

  @Get("get-brands/:categoryId")
  getBrands(@Param("categoryId") categoryId: string) {
    return this.categoryService.getRelatedBrands(categoryId);
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
