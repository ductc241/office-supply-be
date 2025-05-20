import { BadRequestException, Injectable } from "@nestjs/common";
import { ProductRepository } from "./product.repository";
import { CreateFullProductDto } from "./dto/create-product.dto";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { CategoryService } from "../category/category.service";
import { Types } from "mongoose";

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly categoryService: CategoryService,
  ) {}

  getAll() {
    return { data: [] };
  }

  async create(dto: CreateFullProductDto) {
    try {
      const { product: productDto, variants } = dto;

      const category = await this.categoryService.findOne(productDto.category);
      if (category.level !== 2 || !category.is_leaf) {
        throw new BadRequestException("Category must be a level 2 leaf node");
      }

      // Kiểm tra attributes là bắt buộc và không trùng nhau
      const seenCombinations = new Set<string>();

      for (const v of variants) {
        if (!v.attributes || typeof v.attributes !== "object") {
          throw new BadRequestException("Each variant must have attributes");
        }

        const sortedAttr = Object.entries(v.attributes)
          .sort(([k1], [k2]) => k1.localeCompare(k2))
          .map(([k, v]) => `${k}:${v}`)
          .join("|");

        if (seenCombinations.has(sortedAttr)) {
          throw new BadRequestException(
            `Duplicate attribute combination found: ${sortedAttr}`,
          );
        }

        seenCombinations.add(sortedAttr);
      }

      // Tạo Product
      const product = await this.productRepository.create({
        ...productDto,
        category: new Types.ObjectId(dto.product.category),
        brand: new Types.ObjectId(dto.product.brand),
        category_path: [
          ...category.ancestors,
          new Types.ObjectId(productDto.category),
        ],
      });

      // Tạo Variants
      const productId = product._id.toString();
      const variantDocs = variants.map((variant) => ({
        ...variant,
        product: productId,
      }));

      await this.productVariantRepository.create(variantDocs);

      return {
        product,
        variants: await this.productVariantRepository.find({
          product: product._id,
        }),
      };
    } catch (error) {
      // throw new BadRequestException((error as Error).message);
      // console.log(error);
      throw error;
    }
  }
}
