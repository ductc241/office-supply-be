import { Injectable } from "@nestjs/common";
import { StockInRepository } from "../repository/stock-in.repository";
import { InventoryService } from "src/modules/inventory/inventory.service";
import { ProductVariantRepository } from "src/modules/product-variant/product-variant.repository";
import { StockTransactionService } from "src/modules/stock-transaction/stock-transaction.service";
import { StockTransactionType } from "src/modules/stock-transaction/types/stock-transaction.enum";
import { CreateStockInDto } from "../dto/create-stock-in.dto";
import { Types } from "mongoose";

@Injectable()
export class StockInService {
  constructor(
    private readonly stockInRepository: StockInRepository,
    private readonly stockTransactionService: StockTransactionService,
    private readonly inventoryService: InventoryService,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async create(dto: CreateStockInDto) {
    const stockIn: any = await this.stockInRepository.create({
      note: dto.note,
      items: dto.items.map((i) => ({
        ...i,
        variant: new Types.ObjectId(i.variant),
        product: new Types.ObjectId(i.product),
      })),
    });

    for (const item of dto.items) {
      const { product, variant, quantity, cost_price } = item;

      const variantProduct = await this.productVariantRepository.findById(
        item.variant,
      );
      const inventory = await this.inventoryService.findOne({
        variant: new Types.ObjectId(variant),
      });

      const new_average_cost_price =
        (inventory.quantity * variantProduct.average_cost_price +
          quantity * cost_price) /
        (inventory.quantity + quantity);

      // tạo transaction & cập nhật inventory
      await this.stockTransactionService.create({
        variant_id: new Types.ObjectId(variant),
        product_id: new Types.ObjectId(product),
        quantity,
        cost_price,
        average_cost_price_after: new_average_cost_price,
        average_cost_price_before: variantProduct.average_cost_price,
        type: StockTransactionType.IMPORT,
        reference_id: stockIn._id,
      });

      // update product variant infors
      await this.productVariantRepository.updateById(variant, {
        last_cost_price: variantProduct.average_cost_price,
        average_cost_price: new_average_cost_price,
      });
    }

    return stockIn;
  }

  async query() {
    const result = await this.stockInRepository.aggregate([
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "stock-transactions",
          let: {
            stockInId: { $toObjectId: "$_id" },
            variantId: { $toObjectId: "$items.variant" },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$reference_id", "$$stockInId"] },
                    { $eq: ["$variant", "$$variantId"] },
                    { $eq: ["$type", "IMPORT"] },
                  ],
                },
              },
            },
            {
              $project: {
                quantity_before: 1,
                quantity_after: 1,
                average_cost_price_before: 1,
                average_cost_price_after: 1,
              },
            },
          ],
          as: "transaction",
        },
      },
      {
        $unwind: {
          path: "$transaction",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "product-variants",
          localField: "items.variant",
          foreignField: "_id",
          as: "variant",
        },
      },
      {
        $unwind: {
          path: "$variant",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          note: { $first: "$note" },
          createdAt: { $first: "$createdAt" },
          items: {
            $push: {
              quantity: "$items.quantity",
              cost_price: "$items.cost_price",
              transaction: "$transaction",
              product: {
                _id: "$items.product",
                product_name: "$product.name",
              },
              variant: {
                _id: "$items.variant",
                attributes: "$variant.attributes",
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return result;
  }
}
