"use client";

import { IProduct } from "@/types";
import { Search, ShoppingCart, Star, Heart } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/slices/CartSlice";
import { addToWish, removeFromWish } from "@/redux/slices/wishSlice";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuickViewModal from "../common/QuickViewModal";
import Link from "next/link";
import { AnalyticsEvents } from "@/lib/analytics";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          onClick={onClick}
          className="size-8 bg-white rounded-md flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function CustomerFavoriteProductCard({
  product,
  index
}: {
  product: IProduct;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wish.items);
  const wished = wishlistItems.some((item) => item._id === product._id);
  const isOutOfStock = !product?.availableStock || product?.availableStock <= 0;

  const displayImage = product.images?.[0] ?? "/placeholder.png";
  const hasDiscount =
    !!product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100,
      )
    : null;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : null;

const handleCardClick = () => {
  AnalyticsEvents.selectItem({
    product,
    index,
    listId: "home_products",
    listName: "Home Products",
  });

  router.push(`/product/${product.slug}`);
};

  const handleAddToCart = (qty: number = 1) => {
     AnalyticsEvents.addToCart({
          ...product,
    
          quantity: qty,
        });
        
    dispatch(
      addToCart({
        _id: product._id ?? "",
        slug: product?.slug ?? "",
        title: product.title ?? "",
        price: product.price ?? 0,
        discountPrice: product.discountPrice ?? 0,
        images: product.images ?? [],
        availableStock: product.availableStock ?? 0,
        quantity: qty,
      }),
    );
    toast.success(`${product.title} added to cart!`);
    setModalOpen(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wished) {
      dispatch(removeFromWish(product._id as string));
      toast.success("Removed from wishlist");
    } else {
      dispatch(
        addToWish({
          brand: {
            _id: product.brand?._id ?? "",
            slug: product.brand?.slug ?? "",
            title: product.brand?.title ?? "",
          },
          category: {
            _id: product.category[0]?._id ?? "",
            image: product.category?.[0]?.image ?? [],
            slug: product.category?.[0]?.slug ?? "",
            title: product.category?.[0]?.title ?? "",
          },
          description: product?.description ?? "",
          status: product?.status ?? "",
          _id: product._id ?? "",
          slug: product?.slug ?? "",
          title: product.title ?? "",
          price: product.price ?? 0,
          discountPrice: product.discountPrice ?? 0,
          images: product.images ?? [],
          ratings: product?.ratings ?? 0,
        }),
      );
      toast.success("Added to wishlist");
    }
  };

  return (
    <>
      {" "}
      <div
        className="group bg-white h-full rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="bg-white p-3">
          {/* Image */}
          <div className="relative w-full overflow-hidden rounded-md">
            {discountPercent && (
              <Badge className="absolute top-3 left-3 z-10 text-white text-xs font-bold rounded-full px-2 bg-[#F5A623] hover:bg-[#F5A623]">
                -{discountPercent}%
              </Badge>
            )}

            <Image
              src={displayImage}
              alt={product.title}
              width={400}
              height={300}
              className="w-full rounded-md object-cover transition-transform duration-300"
              style={{
                aspectRatio: "4/3",
                transform: hovered ? "scale(1.04)" : "scale(1)",
              }}
            />

            {/* Icon Buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 transition-all duration-300 opacity-100 translate-x-0 md:opacity-0 md:translate-x-10 md:group-hover:opacity-100 md:group-hover:translate-x-0">
              <IconButton
                label="Quick View"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
              >
                <Search size={14} className="text-gray-600" />
              </IconButton>

              <IconButton
                label={wished ? "Remove from Wishlist" : "Add to Wishlist"}
                onClick={handleWishlist}
              >
                <Heart
                  size={14}
                  className={
                    wished
                      ? "fill-[#F5A623] stroke-[#F5A623]"
                      : "stroke-gray-500 fill-none"
                  }
                />
              </IconButton>
            </div>
          </div>

          {/* Info */}
          <div className="px-1 pt-3 pb-1 flex flex-col gap-1">
            {/* Title + Star */}
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-[13px] font-bold text-gray-900 leading-snug flex-1 line-clamp-2">
                {product.title}
              </h3>
              <button
                onClick={handleWishlist}
                className="shrink-0 mt-px"
                aria-label="Add to wishlist"
              >
                <Star
                  size={14}
                  className={
                    wished
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "stroke-gray-300 fill-none"
                  }
                />
              </button>
            </div>

            {/* Category */}
            <Link href={`/shop?category=${product.category?.[0]?.slug}`}>
              <p className="text-xs text-gray-400">{product.category?.[0]?.title}</p>
            </Link>

            {/* Price ↔ Add to Cart swap */}
            <div
              className="relative mt-1 overflow-hidden"
              style={{ height: "32px" }}
            >
              <div
                className="absolute inset-0 flex items-center gap-2 flex-wrap transition-all duration-300"
                style={{
                  opacity: hovered ? 0 : 1,
                  transform: hovered ? "translateY(-100%)" : "translateY(0%)",
                }}
              >
                {originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ৳ {originalPrice.toLocaleString()}.00
                  </span>
                )}
                <span className="text-sm font-bold text-[#F5A623]">
                  ৳ {displayPrice.toLocaleString()}.00
                </span>
              </div>

              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? "translateY(0%)" : "translateY(100%)",
                }}
              >
                {isOutOfStock ? (
                  <button
                    disabled
                    className="
                    w-full h-full
                    rounded-md
                    bg-red-100
                    border border-red-300
                    text-red-500
                    text-sm font-semibold tracking-wide
                    cursor-not-allowed
                    flex items-center justify-center
                    transition-all duration-300
                "
                  >
                    Out of Stock
                  </button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(1);
                    }}
                    className="w-full h-full text-white text-xs font-bold gap-1 rounded-md bg-[#1a1a1a] hover:bg-[#333]"
                  >
                    <ShoppingCart size={13} />
                    Add To Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <QuickViewModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
