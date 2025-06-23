import { BadRequestException, Injectable } from "@nestjs/common";
import { InventoryRepository } from "./inventory.repository";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import ERROR_MESSAGE from "src/shared/constants/error";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { QueryOptions } from "mongoose";
import { SocketGateway } from "../socket/socket.gateway";
import { SendMailService } from "../mail/send-mail.service";
import { InvetoryItem } from "../mail/type/mail.type";

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productVariantRepo: ProductVariantRepository,
    private readonly socketGateway: SocketGateway,
    private readonly sendMailService: SendMailService,
  ) {}

  async create(dto: CreateInventoryDto) {
    const variantIds = dto.variants.map((v) => v.variant);
    const existing = await this.inventoryRepository.find({
      _id: { $in: variantIds },
    });

    if (existing.length > 0) {
      return new BadRequestException(ERROR_MESSAGE.BAD_REQUEST);
    }

    return this.inventoryRepository.createBulk(dto.variants);
  }

  async findOne(conditions: any, options?: QueryOptions) {
    return await this.inventoryRepository.findOne(conditions, options);
  }

  async query() {
    const pipeline: any[] = [
      {
        $group: {
          _id: {
            product_id: "$product",
            variant_id: "$variant",
          },
          quantity: { $sum: "$quantity" },
        },
      },

      {
        $lookup: {
          from: "product-variants",
          localField: "_id.variant_id",
          foreignField: "_id",
          as: "variant",
        },
      },
      {
        $unwind: {
          path: "$variant",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          product: {
            _id: "$_id.product_id",
            name: "$product.name",
          },
          variant_id: "$_id.variant_id",
          quantity: 1,
          attributes: "$variant.attributes",
        },
      },
      {
        $group: {
          _id: "$product",
          product: { $first: "$product" },
          variants: {
            $push: {
              _id: "$variant_id",
              quantity: "$quantity",
              available_quantity: "$available_quantity",
              attributes: "$attributes",
            },
          },
          total_quantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          product: 1,
          variants: 1,
          total_quantity: 1,
        },
      },
    ];

    return this.inventoryRepository.aggregate(pipeline);
  }

  //Cập nhật số lượng tồn kho (dùng cho xuất/nhập kho)
  async updateInventoryQuantity(inventory_id: string, quantity_change: number) {
    const inventory = await this.inventoryRepository.findById(inventory_id);
    if (!inventory) return new BadRequestException(ERROR_MESSAGE.NOT_FOUND);

    const newQuantity = inventory.quantity + quantity_change;

    if (newQuantity < 0) {
      throw new BadRequestException("Số lượng tồn kho không được âm");
    }

    await this.inventoryRepository.updateById(inventory_id, {
      quantity: newQuantity,
    });
  }

  async updateLowStockThreshold(inventory_id: string, threshold: number) {
    return this.inventoryRepository.updateById(inventory_id, {
      low_stock_threshold: threshold,
    });
  }

  async toggleLowStockWarning(inventory_id: string, should_track: boolean) {
    return this.inventoryRepository.updateById(inventory_id, {
      should_track_low_stock: should_track,
    });
  }

  async getLowStockProducts() {
    return this.inventoryRepository.find({
      should_track_low_stock: true,
      $expr: { $lte: ["$quantity", "$low_stock_threshold"] },
    });
  }

  // cronjob function
  async checkLowStock() {
    console.log("start check inventory");

    const inventories = await this.inventoryRepository.find(
      {
        should_track_low_stock: true,
        low_stock_threshold: { $ne: null },
      },
      {
        populate: [
          {
            path: "product",
            select: "name",
          },
          {
            path: "variant",
            select: "attributes",
          },
        ],
      },
    );

    if (!inventories.length) {
      return;
    }

    let totalLowStock = 0;
    const lowStockProducts: InvetoryItem[] = [];
    for (const inventory of inventories) {
      const _inventory: any = { ...inventory.toObject() };

      const threshold = inventory.low_stock_threshold ?? 0;
      const buffer = inventory.early_warning_buffer ?? 0;
      const quantity = inventory.quantity ?? 0;

      const effectiveThreshold = threshold + buffer;

      if (quantity > effectiveThreshold) {
        continue;
      }

      totalLowStock++;
      lowStockProducts.push({
        _id: inventory._id.toString(),
        product: {
          _id: inventory.product._id.toString(),
          name: _inventory.product.name,
        },
        variant: {
          _id: inventory.variant._id.toString(),
          attributes: _inventory.variant.attributes,
        },
        quantity: inventory.quantity,
        low_stock_threshold: inventory.low_stock_threshold,
        early_warning_buffer: inventory.early_warning_buffer,
      });
    }

    if (totalLowStock) {
      // this.socketGateway.sendSystemNoticeToAdmin(
      //   `Có ${totalLowStock} sản phẩm sắp hết hàng, Vui lòng kiểm tra.`,
      // );

      this.sendMailService.sendInventoryReport(lowStockProducts);
    }

    return;
  }
}
