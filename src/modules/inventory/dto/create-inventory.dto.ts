import { Types } from "mongoose";

class InventoryItem {
  product: Types.ObjectId;
  variant: Types.ObjectId;
  quantity: number;
  should_track_low_stock: boolean;
  low_stock_threshold?: number;
  early_warning_buffer?: number;
}

export class CreateInventoryDto {
  variants: InventoryItem[];
}
