import { Types } from "mongoose";

class InventoryItem {
  variant: Types.ObjectId;
  quantity: number;
  should_track_low_stock: boolean;
  low_stock_threshold?: number;
}

export class CreateInventoryDto {
  variants: InventoryItem[];
}
