import { BadRequestException, Injectable } from "@nestjs/common";
import { ProductRepository } from "./product.repository";
import { CreateFullProductDto } from "./dto/create-product.dto";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { CategoryService } from "../category/category.service";
import { QueryOptions, Types } from "mongoose";
import { QueryProductsDto } from "./dto/query-product";
import {
  createPagination,
  PaginationHeaderHelper,
} from "src/shared/pagination/pagination.helper";
import { ProductFilter } from "./types/product.enum";
import ERROR_MESSAGE from "src/shared/constants/error";
import { replaceQuerySearch } from "src/shared/helpers/common";
import { StockTransactionService } from "../stock-transaction/stock-transaction.service";
import { StockTransactionType } from "../stock-transaction/types/stock-transaction.enum";
import { InventoryService } from "../inventory/inventory.service";

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly categoryService: CategoryService,
    private readonly stockTransactionService: StockTransactionService,
    private readonly inventoryService: InventoryService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async query(
    {
      name,
      brandIds,
      productIds,
      categoryIds,
      minPrice,
      maxPrice,
      specifications,
      sort,
      page = 1,
      perPage = 10,
    }: QueryProductsDto,
    // pagination: IPagination,
  ) {
    // const { page, perPage } = pagination;
    const pagination = createPagination(page, perPage);
    const matchStage: any = {};

    if (name) {
      matchStage.name = { $regex: replaceQuerySearch(name), $options: "i" };
    }

    if (specifications) {
      for (const key in specifications) {
        matchStage[`specifications.${key}`] = { $in: specifications[key] };
      }
    }

    if (categoryIds && categoryIds.length > 0) {
      matchStage.category = {
        $in: categoryIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (brandIds && brandIds.length > 0) {
      matchStage.brand = {
        $in: brandIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (productIds && productIds.length > 0) {
      matchStage._id = {
        $in: productIds.map((id) => new Types.ObjectId(id)),
      };
    }

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "product-variants",
          localField: "_id",
          foreignField: "product",
          as: "variants",
        },
      },

      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandInfo",
        },
      },
      { $unwind: "$brandInfo" },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },

      // Add price range + filter matched_variants
      {
        $addFields: {
          matched_variants: {
            $map: {
              input: {
                $filter: {
                  input: "$variants",
                  as: "v",
                  cond: {
                    $and: [
                      minPrice !== undefined
                        ? { $gte: ["$$v.base_price", minPrice] }
                        : {},
                      maxPrice !== undefined
                        ? { $lte: ["$$v.base_price", maxPrice] }
                        : {},
                    ].filter(Boolean),
                  },
                },
              },
              as: "mv",
              in: {
                _id: "$$mv._id",
                attributes: "$$mv.attributes",
                stock: "$$mv.stock",
                base_price: "$$mv.base_price",
              },
            },
          },
        },
      },
      {
        $addFields: {
          price_range: {
            min: { $min: "$matched_variants.base_price" },
            max: { $max: "$matched_variants.base_price" },
          },
          sortPrice: {
            $min: "$matched_variants.base_price",
          },
        },
      },

      // Only keep products with at least one matched variant
      {
        $match: {
          "matched_variants.0": { $exists: true },
        },
      },

      {
        $facet: {
          products: [
            { $sort: { createdAt: -1 } },
            {
              $sort:
                sort === ProductFilter.LOWEST_PRICE
                  ? { sortPrice: 1 }
                  : sort === ProductFilter.HIGHEST_PRICE
                    ? { sortPrice: -1 }
                    : { createdAt: -1 },
            },
            { $skip: (page - 1) * perPage },
            { $limit: perPage },
            {
              $project: {
                name: 1,
                image_preview: 1,
                price_range: 1,
                total_variants: { $size: "$variants" },
                matched_variants: 1,
                brand: {
                  _id: "$brandInfo._id",
                  name: "$brandInfo.name",
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          products: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
    ];

    const [result] = await this.productRepository.aggregate(pipeline);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      result?.total ?? 0,
    );

    return {
      items: result?.products ?? [],
      headers: responseHeaders,
    };
  }

  async findOne(conditions: any, options?: QueryOptions) {
    const product = await this.productRepository.findOne(conditions, options);
    return product;
  }

  async getDetail(productId: string) {
    // product: detai + total variant stock
    // available product attributes
    const product = await this.productRepository.findById(productId, {
      populate: [
        {
          path: "category",
          select: "name is_leaf",
        },
        {
          path: "brand",
          select: "name logo",
        },
      ],
    });

    if (!product) throw new BadRequestException(ERROR_MESSAGE.NOT_FOUND);

    const productAttributes =
      await this.getAvailableProductAttributes(productId);

    return { data: product, ...productAttributes };
  }

  async getAvailableProductAttributes(productId: string) {
    const productVariants = await this.productVariantRepository.find(
      {
        product: new Types.ObjectId(productId),
      },
      {
        projection: {
          attributes: 1,
          stock: 1,
          base_price: 1,
        },
      },
    );

    const attributesMap = {};

    for (const variant of productVariants) {
      const attributes = variant.attributes || {};
      for (const [key, value] of Object.entries(attributes)) {
        if (!attributesMap[key]) {
          attributesMap[key] = new Set();
        }
        attributesMap[key].add(value);
      }
    }

    const availableAttributes: Record<string, any[]> = {};

    for (const key in attributesMap) {
      availableAttributes[key] = Array.from(attributesMap[key]);
    }

    return { attributes: availableAttributes, variants: productVariants };
  }

  async getUniqueSpecValuesByCategory(categoryId: string) {
    const pipeline = [
      [
        {
          $match: {
            category: new Types.ObjectId(categoryId),
          },
        },
        // Chuyển specifications thành mảng key-value
        {
          $project: {
            specifications: { $objectToArray: "$specifications" },
          },
        },
        {
          $unwind: "$specifications",
        },
        // Nhóm theo key của specifications và lấy giá trị không trùng lặp
        {
          $group: {
            _id: "$specifications.k",
            values: { $addToSet: "$specifications.v" },
          },
        },
        {
          $group: {
            _id: null,
            specs: {
              $push: {
                k: "$_id",
                v: "$values",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            specs: { $arrayToObject: "$specs" },
          },
        },
      ],
    ];

    const [result] = await this.productRepository.aggregate(pipeline);
    return result ?? { specs: {} };
  }

  async create(dto: CreateFullProductDto) {
    try {
      const { product: productDto, variants } = dto;

      const category = await this.categoryService.findOne(productDto.category);
      if (category.level !== 2 || !category.is_leaf) {
        throw new BadRequestException("Category must be a level 2 leaf node");
      }

      if (variants.length > 1 && variants[0].attributes !== null) {
        // Kiểm tra variant attributes là bắt buộc và không trùng nhau
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
        product: new Types.ObjectId(productId),
        sku: variant.sku,
        attributes: variant.attributes,
        base_price: variant.base_price,
        min_price: variant.min_price,
        max_price: variant.max_price,
        last_cost_price: variant.cost_price,
        average_cost_price: variant.cost_price,
      }));

      const newVariants: any =
        await this.productVariantRepository.createBulk(variantDocs);

      // Tạo inventory
      const variantInventories = newVariants.map((v) => {
        return {
          variant: v._id,
          quantity: variants.find((vd) => vd.sku === v.sku).stock,
          should_track_low_stock: false,
        };
      });
      await this.inventoryService.create({
        variants: variantInventories,
      });

      // Tạo stock transaction
      dto.variants.forEach((v) => {
        if (v.stock) {
          const variant = newVariants.find((_v) => v.sku === _v.sku);

          if (variant) {
            this.stockTransactionService.create({
              product_id: product._id,
              variant_id: variant._id,
              quantity: v.stock,
              cost_price: variant.average_cost_price,
              average_cost_price_after: variant.average_cost_price,
              average_cost_price_before: variant.average_cost_price,
              type: StockTransactionType.INIT,
            });
          }
        }
      });

      return {
        product,
        variants: await this.productVariantRepository.find({
          product: product._id,
        }),
      };
    } catch (error) {
      // throw new BadRequestException((error as Error).message);
      console.log(error);
      throw error;
    }
  }
}
