import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CategoryService } from "./category.service";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { ApiOperation } from "@nestjs/swagger";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  query() {
    return this.categoryService.query();
  }

  @ApiOperation({
    summary: "web - get category list in tree form",
  })
  @Get("get-tree")
  getTree() {
    return this.categoryService.getTree();
  }

  @ApiOperation({
    summary: "web - get category detail with child categories",
  })
  @Get("get-detail/:categoryId")
  getDetail(@Param("categoryId") categoryId: string) {
    return this.categoryService.getDetail(categoryId);
  }

  @Get("get-attributes/:categoryId")
  getChild(@Param("categoryId") categoryId: string) {
    return this.categoryService.getAttributes(categoryId);
  }

  @Get("find/:categoryId")
  findOne(@Param("categoryId") categoryId: string) {
    return this.categoryService.findOne(categoryId);
  }

  @ApiOperation({
    summary:
      "web - get the list of sibling categories that share the same parent.",
  })
  @Get("get-sibling/:categoryId")
  getSibling(@Param("categoryId") categoryId: string) {
    return this.categoryService.getSibling(categoryId);
  }

  @Get("get-brands/:categoryId")
  getBrands(@Param("categoryId") categoryId: string) {
    return this.categoryService.getRelatedBrands(categoryId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.brandService.remove(id);
  // }

  @Get("top-categories")
  async getTopCategories(@Query("limit") limit?: string) {
    const topCategories =
      await this.categoryService.getTopCategoriesByProductCount(
        limit ? parseInt(limit, 10) : 10,
      );
    return topCategories;
  }
}
