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
import { QueryStockTransactionDto } from "./dto/query-transaction.dto";
import { QueryOptions, Types } from "mongoose";
import { IPagination } from "src/shared/pagination/pagination.interface";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";

@Injectable()
export class StockTransactionService {
  constructor(
    private readonly stockTransactionRepository: StockTransactionRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async create(payload: CreateStockTransactionDto) {
    const {
      variant_id,
      quantity,
      type,
      note,
      reference_id,
      cost_price,
      product_id,
      average_cost_price_after,
      average_cost_price_before,
    } = payload;

    const variant = await this.productVariantRepository.findById(
      variant_id.toString(),
    );
    if (!variant) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    const variantInventory = await this.inventoryRepository.findOne({
      variant: variant_id,
    });
    if (!variantInventory) {
      throw new NotFoundException("Không tìm thấy bản ghi tồn kho");
    }

    let quantityChange = 0;
    switch (type) {
      case StockTransactionType.INIT:
        quantityChange = 0;
        break;
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
    await this.inventoryRepository.updateOne(
      {
        variant: variant_id,
      },
      {
        $inc: { quantity: quantityChange },
      },
    );

    // log
    const transaction = await this.stockTransactionRepository.create({
      product: product_id,
      variant: variant_id,
      quantity,
      quantity_before:
        type === StockTransactionType.INIT ? 0 : variantInventory.quantity,
      quantity_after: variantInventory.quantity + quantityChange,
      cost_price,
      average_cost_price_before,
      average_cost_price_after,
      type,
      reference_id,
      note,
    });

    return transaction;
  }

  async query(params: QueryStockTransactionDto, pagination: IPagination) {
    const { product_id, type, reference_id, from_date, to_date } = params;
    const options: QueryOptions = {
      populate: [
        {
          path: "product",
          select: "name",
        },
        {
          path: "variant",
          select: "sku attributes",
        },
      ],
      // sort: "-createdAt",
      limit: pagination.perPage,
      skip: pagination.startIndex,
    };

    const conditions: any = {};

    if (product_id) {
      conditions.product = new Types.ObjectId(product_id);
    }

    if (type) {
      conditions.type = type;
    }

    if (reference_id) {
      conditions.reference_id = reference_id;
    }

    if (from_date || to_date) {
      conditions.createdAt = {};

      if (from_date) {
        const fromDate = new Date(from_date);
        fromDate.setUTCHours(0, 0, 0, 0);
        conditions.createdAt.$gte = fromDate;
      }

      if (to_date) {
        const toDate = new Date(to_date);
        toDate.setUTCHours(23, 59, 59, 999);
        conditions.createdAt.$lte = toDate;
      }
    }

    // return this.stockTransactionRepository.find(conditions, options);
    const [result, totalCount] = await Promise.all([
      this.stockTransactionRepository.find(conditions, options),
      this.stockTransactionRepository.count(conditions),
    ]);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      totalCount ?? 0,
    );

    return {
      items: result,
      headers: responseHeaders,
    };
  }
}
