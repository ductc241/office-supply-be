import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";

import { CartRepository } from "./cart.repository";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import ERROR_MESSAGE from "src/shared/constants/error";
import { DecreaseCartItemDto } from "./dto/decrease-cart-item.dto";
import { InventoryService } from "../inventory/inventory.service";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoy: CartRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async get(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);

      let cart = await this.cartRepositoy.findOne(
        { user: userObjectId },
        {
          populate: {
            path: "items.variant",
            select: "base_price stock attributes",

            populate: {
              path: "product",
              select: "name image_preview",
            },
          },
          projection: "user items",
        },
      );

      if (!cart) {
        cart = await this.cartRepositoy.create({
          user: userObjectId,
          items: [],
        });
      }

      const items = cart.items.map((item) => {
        const variant = item.variant as any;
        return {
          variant_id: variant._id,
          product_id: variant.product._id,
          image: variant.product.image_preview,
          quantity: item.quantity,
          name: variant.product.name,
          attributes: variant.attributes,
          stock: variant.stock,
          base_price: variant.base_price,
        };
      });

      return {
        ...cart.toObject(),
        items,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async clear(userId: string) {
    const cart = await this.cartRepositoy.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    cart.items = [];
    return this.cartRepositoy.save(cart);
  }

  async increase(userId: string, dto: AddCartItemDto) {
    const userObjectId = new Types.ObjectId(userId);
    const variantObjectId = new Types.ObjectId(dto.variant_id);

    const cart = await this.cartRepositoy.findOne({ user: userObjectId });
    if (!cart) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    const inventory = await this.inventoryService.findOne({
      variant: new Types.ObjectId(dto.variant_id),
    });
    if (!inventory) throw new NotFoundException();

    if (inventory.quantity <= inventory.low_stock_threshold) {
      throw new BadRequestException("The product is out of stock");
    }

    const existingItem = cart.items.find((item) =>
      item.variant.equals(variantObjectId),
    );

    if (existingItem) {
      await this.cartRepositoy.updateOne(
        { user: userObjectId, "items.variant": variantObjectId },
        { $inc: { "items.$.quantity": dto.quantity } },
      );
    } else {
      await this.cartRepositoy.updateOne(
        { user: userObjectId },
        {
          $push: {
            items: {
              variant: variantObjectId,
              quantity: dto.quantity,
            },
          },
        },
      );
    }

    const updatedCart = await this.get(userId);
    return updatedCart.items;
  }

  async decrease(user_id: string, dto: DecreaseCartItemDto) {
    const userObjectId = new Types.ObjectId(user_id);
    const variantObjectId = new Types.ObjectId(dto.variant_id);

    const cart = await this.cartRepositoy.findOne({ user: userObjectId });
    if (!cart) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

    const existingItem = cart.items.find((item) =>
      item.variant.equals(variantObjectId),
    );
    if (!existingItem) {
      throw new NotFoundException("Item not found in cart");
    }

    if (existingItem.quantity <= dto.quantity) {
      // Nếu giảm >= hiện tại → xoá luôn
      await this.cartRepositoy.updateOne(
        { user: userObjectId },
        { $pull: { items: { variant: variantObjectId } } },
      );
    } else {
      // Giảm quantity
      await this.cartRepositoy.updateOne(
        { user: userObjectId, "items.variant": variantObjectId },
        { $inc: { "items.$.quantity": -dto.quantity } },
      );
    }

    await this.cartRepositoy.findOne({
      user: userObjectId,
    });

    const updatedCart = await this.get(user_id);
    return updatedCart.items;
  }
}
