import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { Types } from "mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { BrandService } from "../brand/brand.service";
import ERROR_MESSAGE from "src/shared/constants/error";

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandService: BrandService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException("Category name must be unique.");
    }

    let brands = [];

    if (dto.brands && dto.brands.length > 0) {
      const brandIds = dto.brands.map((item) => new Types.ObjectId(item));

      const validBrands = await this.brandService.countAll({
        _id: { $in: brandIds },
      });

      if (validBrands !== dto.brands.length)
        throw new BadRequestException("Brand doesnt exist");

      brands = brandIds;
    }

    let parentId = null;
    let ancestors: Types.ObjectId[] = [];
    let level = 0;

    if (dto.parentId) {
      parentId = new Types.ObjectId(dto.parentId);
      const parent = await this.categoryRepository.findById(parentId);
      if (!parent) {
        throw new NotFoundException("Parent category not found.");
      }

      if (parent.level >= 2) {
        throw new BadRequestException("Category depth cannot exceed level 2.");
      }

      ancestors = [...(parent.ancestors || []), parent._id];
      level = parent.level + 1;

      // Cập nhật parent thành không còn là leaf
      if (parent.is_leaf) {
        await this.categoryRepository.updateById(parent._id, {
          is_leaf: false,
        });
      }
    }

    return this.categoryRepository.create({
      name: dto.name,
      logo: dto.logo,
      parentId,
      ancestors,
      level,
      is_leaf: true,
      attributes: dto.attributes,
      brands,
    });
  }

  async query() {
    return this.categoryRepository.find({});
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async getDetail(id: string) {
    try {
      const category = await this.categoryRepository.findById(id, {
        projection: {
          name: 1,
        },
        populate: {
          path: "brands",
          select: "name logo",
        },
      });
      if (!category) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

      const childCategories = await this.getChild(id);

      return { data: category, children: childCategories };
    } catch (error) {
      console.log(error);
    }
  }

  async getTree() {
    const categories = await this.categoryRepository.find({});

    const categoryMap = new Map<string, any>();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), {
        _id: category._id,
        name: category.name,
        display_name: category.name,
        parent_id: category.parentId ? category.parentId.toString() : "0",
        has_children: false,
        children: [],
      });
    });

    const tree = [];

    categoryMap.forEach((category) => {
      if (category.parent_id === "0") {
        tree.push(category);
      } else {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(category);
          parent.has_children = true;
        }
      }
    });

    return tree;
  }

  async getChild(categoryId: string) {
    try {
      const categories = await this.categoryRepository.find(
        {
          parentId: new Types.ObjectId(categoryId),
        },
        {
          projection: { name: 1, logo: 1, is_leaf: 1 },
        },
      );
      const categoryIds = categories.map((category) => category._id);

      const childCategories = await this.categoryRepository.find(
        {
          parentId: { $in: categoryIds },
        },
        {
          projection: { name: 1, parentId: 1, logo: 1, is_leaf: 1 },
        },
      );

      const listChild = categories.map((category) => ({
        ...category.toObject(),
        children: [],
      }));

      listChild.forEach((child) => {
        childCategories.forEach((category) => {
          if (category.parentId.toString() === child._id.toString()) {
            child.children.push(category);
          }
        });
      });

      return listChild;
    } catch (error) {
      throw error;
    }
  }

  async getSibling(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) throw new BadRequestException(ERROR_MESSAGE.NOT_FOUND);

    return await this.categoryRepository.find(
      {
        _id: {
          $ne: [new Types.ObjectId(categoryId)],
        },
        parentId: category.parentId,
        level: category.level,
      },
      {
        projection: {
          name: 1,
          logo: 1,
          is_leaf: 1,
        },
      },
    );
  }

  async getRelatedBrands(categoryId: string) {
    try {
      const category = await this.categoryRepository.findById(categoryId, {
        populate: {
          path: "brands",
          select: "_id name logo",
        },
      });

      if (!category) {
        throw new BadRequestException(ERROR_MESSAGE.NOT_FOUND);
      }
      return category.brands;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<{ name: string }>) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException("Category not found");

    if (updates.name && updates.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        name: updates.name,
      });
      if (existing) {
        throw new BadRequestException("Category name must be unique.");
      }
    }

    return this.categoryRepository.updateById(id, updates);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException("Category not found");

    const children = await this.categoryRepository.find({
      parentId: category._id,
    });
    if (children.length > 0) {
      throw new BadRequestException(
        "Cannot delete a category with subcategories.",
      );
    }

    const deleted = await this.categoryRepository.deleteById(id);

    // Kiểm tra và cập nhật lại parent nếu không còn con
    if (category.parentId) {
      const siblings = await this.categoryRepository.find({
        parentId: category.parentId,
      });
      if (siblings.length === 0) {
        await this.categoryRepository.updateById(category.parentId.toString(), {
          is_leaf: true,
        });
      }
    }

    return deleted;
  }
}
