/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Search, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/slices/CartSlice";
import { addToWish, removeFromWish } from "@/redux/slices/wishSlice";
import { RootState } from "@/redux/store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuickViewModal from "./QuickViewModal";
import { AnalyticsEvents } from "@/lib/analytics";

interface ProductCardProps {
  product: any;
  index?: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const {
    slug,
    title,
    category,
    images,
    price,
    discountPrice,
    ratings,
    brand,
  } = product;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const wishlistItems = useSelector((state: RootState) => state.wish.items);

  const wished = wishlistItems.some((item) => item._id === product._id);
  // const hasDiscount = typeof discountPrice === "number" && discountPrice > price;
  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < (price ?? 0);

  const [btnHovered, setBtnHovered] = useState(false);

  const dispatch = useDispatch();

  const productHref = slug ? `/product/${slug}` : "#";
  const categoryHref = `/shop?category=${category?.slug ?? ""}`;
  const isOutOfStock = !product?.availableStock || product.availableStock <= 0;

  const onWishlist = () => {
    if (wished) {
      if (product?._id != null) {
        dispatch(removeFromWish(product._id));
      }
      toast.success("Removed from wishlist");
    } else {
      dispatch(
        addToWish({
          brand: {
            _id: brand?._id ?? "",
            slug: brand?.slug ?? "",
            title: brand?.title ?? "",
          },
          category: {
            _id: category[0]?._id ?? "",
            image: category[0]?.image ?? [],
            slug: category[0]?.slug ?? "",
            title: category[0]?.title ?? "",
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

  const onAddToCart = () => {
    AnalyticsEvents.addToCart({
      ...product,

      quantity: 1,
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
        quantity: 1,
      }),
    );


    toast.success(`${title} added to cart!`);
  };

  return (
    <>
      <div
        className="group w-full block rounded-2xl border overflow-hidden p-2 relative md:flex flex-col h-full
          transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
      >
        {/* Wishlist */}
        <Tooltip>
          <TooltipTrigger
            onClick={() => {
              setSelectedSlug(slug);
              setModalOpen(true);
            }}
            className={cn(
              "absolute cursor-pointer top-3 right-3 z-10 bg-white shadow-md p-2 rounded-[8px] transition-all duration-300",
              "opacity-100 lg:opacity-0 lg:translate-x-10 lg:group-hover:opacity-100 lg:group-hover:translate-x-0",
            )}
          >
            <Search size={15} className="text-gray-500" />
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>Quick Zoom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              "absolute cursor-pointer top-12 right-3 z-10 bg-white shadow-md p-2 rounded-[8px] transition-all duration-300",
              "opacity-100 lg:opacity-0 lg:translate-x-10 lg:group-hover:opacity-100 lg:group-hover:translate-x-0",
            )}
            onClick={onWishlist}
          >
            <Heart
              size={15}
              className={cn(
                "w-4 h-4",
                wished ? "fill-red-500 text-red-500" : "text-gray-500",
              )}
            />
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>Add to wishlist</p>
          </TooltipContent>
        </Tooltip>

        {/* IMAGE */}
        <Link href={productHref}>
          <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden cursor-pointer">
            {images?.length > 0 ? (
              <Image
                src={images[0]}
                alt={title ?? "Product"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
        </Link>

        {/* INFO */}
        <div className="px-1 pt-2 pb-1 flex flex-col gap-2 flex-1">
          {/* Top Content */}
          <div>
            {/* TITLE */}
            <Link href={productHref}>
              <p className="text-[13.5px] font-bold text-gray-900 hover:text-amber-400 line-clamp-2">
                {title}
              </p>
            </Link>

            {/* CATEGORY */}
            <Link href={categoryHref}>
              <p className="text-[12px] font-bold text-gray-400 hover:text-amber-400">
                {category[0]?.title}
              </p>
            </Link>

            {/* STARS */}
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < (ratings ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Bottom Content */}
          <div className="mt-auto">
            {/* PRICE */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Discount Price (main price) */}
              <p className="text-[14px] font-bold text-yellow-500 mb-2">
                ৳{" "}
                {(hasDiscount ? discountPrice : (price ?? 0)).toLocaleString(
                  "en-BD",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </p>

              {/* Original Price */}
              {hasDiscount && (
                <p className="text-[12px] font-bold text-gray-500 mb-2 line-through">
                  ৳{" "}
                  {(price ?? 0).toLocaleString("en-BD", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>

            {/* BUTTON */}
            {isOutOfStock ? (
              <button
                disabled
                className="
                    w-full h-12
                    rounded-md
                    bg-red-100
                    border border-red-300
                    text-red-500
                    text-sm font-semibold tracking-wide
                    cursor-not-allowed
                    flex items-center justify-center
                    transition-all duration-300
                    mb-1
                "
              >
                Out of Stock
              </button>
            ) : (
              <Button
                onClick={onAddToCart}
                disabled={isOutOfStock}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                className={cn(
                  "w-full h-12",
                  "text-white text-[13px] font-semibold tracking-wide",
                  "relative overflow-hidden",
                  "bg-[#1e2a38] hover:text-amber-400",
                  "transition-all duration-300",
                  "cursor-pointer",
                )}
              >
                {/* TEXT */}
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300",
                    btnHovered
                      ? "-translate-y-full opacity-0"
                      : "translate-y-0 opacity-100",
                  )}
                >
                  Add To Cart
                </span>

                {/* ICON */}
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300",
                    btnHovered
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0",
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {selectedSlug && modalOpen && (
        <QuickViewModal
          product={product}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;
