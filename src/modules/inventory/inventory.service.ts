import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InventoryRepository } from "./inventory.repository";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { WarehouseRepository } from "../warehouse/warehouse.repository";
import ERROR_MESSAGE from "src/shared/constants/error";

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productVariantRepo: ProductVariantRepository,
  ) {}

  async create(variantId: string, warehouseId: string) {
    const existing = await this.inventoryRepository.findOne({
      variant: variantId,
      warehouse: warehouseId,
    });
    if (existing) return existing;

    const variant = await this.productVariantRepo.findById(variantId);
    if (!variant) throw new NotFoundException("Product variant không tồn tại");

    return this.inventoryRepository.create({
      product_variant_id: variantId,
      quantity: 0,
      should_track_low_stock: true,
      low_stock_threshold: variant.low_stock_threshold ?? 5, // default
    });
  }

  /**
   * Cập nhật số lượng tồn kho (dùng cho xuất/nhập kho)
   */
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

  /**
   * Cập nhật ngưỡng cảnh báo tồn kho
   */
  async updateLowStockThreshold(inventory_id: string, threshold: number) {
    return this.inventoryRepository.updateById(inventory_id, {
      low_stock_threshold: threshold,
    });
  }

  /**
   * Bật/tắt theo dõi cảnh báo tồn kho
   */
  async toggleLowStockWarning(inventory_id: string, should_track: boolean) {
    return this.inventoryRepository.updateById(inventory_id, {
      should_track_low_stock: should_track,
    });
  }

  /**
   * Tìm các sản phẩm sắp hết hàng (dùng cho cron cảnh báo)
   */
  async getLowStockProducts() {
    return this.inventoryRepository.find({
      should_track_low_stock: true,
      $expr: { $lte: ["$quantity", "$low_stock_threshold"] },
    });
  }
}
