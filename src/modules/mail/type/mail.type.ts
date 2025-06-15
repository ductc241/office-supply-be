export class InvetoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  variant: {
    _id: string;
    attributes: Record<string, string>;
  };
  quantity: number;
  low_stock_threshold: number;
  early_warning_buffer: number;
}
