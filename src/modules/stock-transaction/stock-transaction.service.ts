import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { StockTransactionRepository } from "./stock-transaction.repository";
import { StockTransactionType } from "./types/stock-transaction.enum";
import { CreateStockTransactionDto } from "./dto/create-transaction.dto";
import { ProductVariantRepository } from "../product-variant/product-variant.repository";
import { InventoryRepository } from "../inventory/inventory.repository";

@Injectable()
export class StockTransactionService {
  constructor(
    private readonly stockTransactionRepository: StockTransactionRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async create(payload: CreateStockTransactionDto) {
    const {
      variant_id,
      warehouse_id,
      quantity,
      type,
      note,
      reference_type,
      reference_id,
    } = payload;

    const variant = await this.productVariantRepository.findById(variant_id);
    if (!variant) {
      throw new NotFoundException("Product variant không tồn tại");
    }

    const variantInventory = await this.inventoryRepository.findOne({
      variant: variant_id,
      warehouse: warehouse_id,
    });
    if (!variantInventory) {
      throw new NotFoundException("Không tìm thấy bản ghi tồn kho");
    }

    let quantityChange = 0;
    switch (type) {
      case StockTransactionType.IMPORT:
      case StockTransactionType.ORDER_CANCEL_IMPORT:
      case StockTransactionType.ADJUSTMENT:
        quantityChange = quantity;
        break;

      case StockTransactionType.OTHER_EXPORT:
      case StockTransactionType.ORDER_EXPORT:
        if (variantInventory.quantity < quantity) {
          throw new BadRequestException("Không đủ tồn kho để xuất");
        }
        quantityChange = -quantity;
        break;

      default:
        throw new BadRequestException(`Loại transaction không hợp lệ: ${type}`);
    }

    // 3. Cập nhật tồn kho
    await this.inventoryRepository.updateQuantity(
      variant_id,
      warehouse_id,
      quantityChange,
    );

    const transaction = await this.stockTransactionRepository.create({
      variant: variant_id,
      warehouse: warehouse_id,
      quantity,
      quantity_before: variantInventory.quantity,
      quantity_after: variantInventory.quantity + quantityChange,
      type,
      reference_type,
      reference_id,
      note,
    });

    return transaction;
  }

  // async query(filter: StockTransactionFilterDto) {
  //   return this.stockTransactionRepository.findWithFilter(filter);
  // }

  // async getTransactionById(id: string) {
  //   const transaction = await this.stockTransactionRepository.findById(id);
  //   if (!transaction) {
  //     throw new NotFoundException("Không tìm thấy transaction");
  //   }
  //   return transaction;
  // }
}
