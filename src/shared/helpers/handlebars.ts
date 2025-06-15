import * as Handlebars from "handlebars";

Handlebars.registerHelper(
  "fullProductName",
  function (productName: string, attributes: Record<string, string>) {
    if (!attributes || typeof attributes !== "object") return productName;

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return `${productName} (${attrs})`;
  },
);

Handlebars.registerHelper(
  "availableBalance",
  function (quantity: number, lowStock: number) {
    return quantity - lowStock;
  },
);
