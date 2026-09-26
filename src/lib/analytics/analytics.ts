
import { CartItem } from "@/types/cart.types";
import { IProduct } from "@/types";

export const CURRENCY = "BDT";
const AFFILIATION = "Farin Fusion";

export const mapItem = (
  item: Partial<IProduct & CartItem>,
  index?: number,
  listId?: string,
  listName?: string,
) => ({
  item_id: item._id,
  item_name: item.title,

  affiliation: AFFILIATION,

  item_brand: item.brand?.title,

  item_category: item.category?.[0]?.title,

  item_variant: "",

  item_list_id: listId,

  item_list_name: listName,

  index,

  quantity: item.quantity ?? 1,

  price:
    item.discountPrice && item.discountPrice > 0
      ? item.discountPrice
      : item.price,

  discount:
    item.discountPrice && item.price
      ? item.price - item.discountPrice
      : 0,
});

export const cartValue = (items: CartItem[]) =>
  items.reduce((sum, item) => {
    const price =
      item.discountPrice && item.discountPrice > 0
        ? item.discountPrice
        : item.price;

    return sum + price * item.quantity;
  }, 0);