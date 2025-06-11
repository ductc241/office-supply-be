export enum StockTransactionType {
  IMPORT = "IMPORT",
  ORDER_CANCEL_IMPORT = "ORDER_CANCEL_IMPORT",
  ORDER_EXPORT = "ORDER_EXPORT",
  OTHER_EXPORT = "OTHER_EXPORT",
  ADJUSTMENT = "ADJUSTMENT",
  INTERNAL_TRANSFER = "INTERNAL_TRANSFER", // chuyển kho
}

export enum StockTransactionReferenceType {
  "ORDER" = "ORDER",
  "STOCK_IN" = "STOCK-IN",
  "STOCK_OUT" = "STOCK-OUT",
  "MANUAL" = "MANUAL",
}
