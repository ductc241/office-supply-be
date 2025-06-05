import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";

import { CartRepository } from "./cart.repository";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import ERROR_MESSAGE from "src/shared/constants/error";
import { DecreaseCartItemDto } from "./dto/decrease-cart-item.dto";

@Injectable()
export class CartService {
  constructor(private readonly cartRepositoy: CartRepository) {}

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
          stock: variant.product.stock,
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

  async add(userId: string, dto: AddCartItemDto) {
    const userObjectId = new Types.ObjectId(userId);
    const variantObjectId = new Types.ObjectId(dto.variant_id);

    const cart = await this.cartRepositoy.findOne({ user: userObjectId });
    if (!cart) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);

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

  async decrease(user_id: string, item_id: string, dto: DecreaseCartItemDto) {
    const userObjectId = new Types.ObjectId(user_id);
    const variantObjectId = new Types.ObjectId(item_id);

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

    const updatedCart = await this.cartRepositoy.findOne({
      user: userObjectId,
    });
    return updatedCart.items;
  }
}
