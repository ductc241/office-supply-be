import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { Types } from "mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException("Category name must be unique.");
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

      // Cập nhật parent thành không còn là leaf nếu cần
      if (parent.is_leaf) {
        await this.categoryRepository.updateById(parent._id, {
          is_leaf: false,
        });
      }
    }

    return this.categoryRepository.create({
      name: dto.name,
      parentId,
      ancestors,
      level,
      is_leaf: true,
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
