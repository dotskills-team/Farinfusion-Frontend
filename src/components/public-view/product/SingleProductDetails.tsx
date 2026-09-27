/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

import {
  useGetSingleProductQuery,
  useGetAllProductsQuery,
} from "@/redux/features/product/product.api";
import ProductImageGallery from "@/components/public-view/product/ProductImageGallery";
import ProductCard from "../common/ProductCard";
import Image from "next/image";
import placeholderImage from "../../../../public/product-placeholder.png";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { addToCart } from "@/redux/slices/CartSlice";
import SingleProductSkeleton from "./SingleProductSkeleton";
import { AnalyticsEvents } from "@/lib/analytics";

const SingleProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const dispatch = useDispatch();
  const cartList = useSelector((state: RootState) => state.cart.items);

  const { data, isLoading, isError } = useGetSingleProductQuery(slug, {
    skip: !slug,
  });

  const { data: allProductsData } = useGetAllProductsQuery(
    {
      limit: 10,
      page: 1,
    },
    {
      skip: !slug,
    },
  );

  const product = data?.data;
  const recentProducts = useMemo(() => {
    return [...(allProductsData?.data || [])].sort(
      (a, b) =>
        new Date(b?.createdAt ?? "").getTime() -
        new Date(a?.createdAt ?? "").getTime(),
    );
  }, [allProductsData]);

  useEffect(() => {
    if (!recentProducts.length) return;

    AnalyticsEvents.viewItemList({
      products: recentProducts,
      listId: "recent_products",
      listName: "Recently Viewed Products",
    });
  }, [recentProducts]);

  const [qty, setQty] = useState(1);

  const cartItem = cartList.find(
    (item) => item?.slug === product?.slug || item?._id === product?._id,
  );

  const availableStock = product?.availableStock || 0;
  const isOutOfStock = !product?.availableStock || product?.availableStock <= 0;
  // const isMaxQtyReached = cartItem && cartItem.quantity >= availableStock;

  useEffect(() => {
    if (!product) return;

    AnalyticsEvents.viewItem(product);
  }, [product]);

  if (isLoading) {
    return <SingleProductSkeleton />;
  }

  if (isError || !product) {
    return <p className="p-10 text-center">Product not found</p>;
  }

  const {
    title,
    brand,
    category,
    images = [],
    price,
    discountPrice,
    description,
  }: any = product;

  // const rating = ratings || 0;
  // const reviewCount = reviews?.length || 0;
  const displayPrice = discountPrice || price;

  const discount =
    price && discountPrice && price > discountPrice
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  // const watchingCount = 12;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        quantity: qty,
      }),
    );

    AnalyticsEvents.addToCart({
      ...product,

      quantity: qty,
    });

    toast.success(`${title} added to cart!`);
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        ...product,
        quantity: qty,
      }),
    );

    AnalyticsEvents.addToCart({
      ...product,

      quantity: qty,
    });

    AnalyticsEvents.beginCheckout([
      {
        ...product,
        quantity: qty,
      },
    ]);

    router.push("/checkout");
  };

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="font-semibold text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />

{product?.category && product.category.length > 0 && (
  <>
    <Link
      href={`/shop?category=${product.category[0]?.slug}`}
      className="font-semibold text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
    >
      {product.category[0]?.title}
    </Link>
    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
  </>
)}

            <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full bg-linear-to-br from-amber-50 via-orange-50/60 to-amber-100/40">
          <div className="container mx-auto py-10">
            <div className="flex flex-col lg:flex-row gap-6 p-4">
              {/* LEFT — Gallery */}
              <div className="lg:w-[50%]">
                <div className="rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-amber-100">
                  {images.length > 0 ? (
                    <ProductImageGallery images={images} title={title}  isOutOfStock={isOutOfStock} />
                  ) : (
                    <Image src={placeholderImage} alt={title} />
                  )}
                </div>
              </div>

              {/* RIGHT — Info Card */}
              <div className="flex-1 flex flex-col gap-5 bg-white shadow-md rounded-2xl p-6 sm:p-7 border border-amber-100/70">
                {/* Title */}
                <h1 className="text-2xl lg:text-[26px] font-bold text-amber-600 leading-snug">
                  {title}
                </h1>

                {/* Spec list — mirrors reference screenshot's bullet block */}
                <ul className="space-y-2 text-[15px] text-gray-700">
                  {brand?.title && (
                    <li className="flex gap-2">
                      {/* <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> */}
                      <span>
                        Brand:{" "}
                        <button
                          onClick={() =>
                            router.push(`/shop?brand=${product?.brand?.slug}`)
                          }
                          className="font-semibold text-amber-600 hover:text-amber-700  transition-colors duration-200 cursor-pointer"
                        >
                          {brand?.title}
                        </button>
                      </span>
                    </li>
                  )}
                  {product?.title && (
                    <li className="flex gap-2">
                      {/* <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> */}
                      <span>
                        Product Name:{" "}
                        <button
                          onClick={() =>
                            router.push(`/product/${product?.slug}`)
                          }
                          className="font-semibold text-amber-600 hover:text-amber-700  transition-colors duration-200 cursor-pointer"
                        >
                          {product?.title}
                        </button>
                      </span>
                    </li>
                  )}
                  {product?.category && product.category.length > 0  && (
                    <li className="flex gap-2">
                      <span>
                        Category:{" "}
                        <button
                          onClick={() =>
                            router.push(
                              `/shop?category=${product?.category[0]?.slug}`,
                            )
                          }
                          className="font-semibold text-amber-600 hover:text-amber-700  transition-colors duration-200 cursor-pointer"
                        >
                          {product?.category[0]?.title}
                        </button>
                      </span>
                    </li>
                  )}
                  <li className="flex gap-2">
                    {/* <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> */}
                    <span>
                      Status:{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          isOutOfStock ? "text-red-500" : "text-emerald-600",
                        )}
                      >
                        {isOutOfStock ? "Out of stock" : "In stock"}
                      </span>
                    </span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-4 items-center">
                  {/* price */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                      ৳{displayPrice}
                    </span>

                    {discount > 0 && (
                      <>
                        <span className="line-through text-gray-400 text-lg">
                          ৳{price}
                        </span>
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                          -{discount}%
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* QTY + Stepper */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center rounded-full border-2 border-amber-200 bg-amber-50/60 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setQty((p) => Math.max(1, p - 1))}
                        disabled={qty <= 1}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all duration-200",
                          qty <= 1
                            ? "opacity-40 cursor-not-allowed pointer-events-none"
                            : "hover:bg-amber-100 active:scale-90 cursor-pointer pointer-events-auto",
                        )}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 text-amber-700" />
                      </button>

                      <span className="w-10 text-center font-semibold text-gray-900 select-none">
                        {qty}
                      </span>

                      <button
                        onClick={() => {
                          const existingQty = cartItem?.quantity || 0;

                          if (existingQty + qty < availableStock) {
                            setQty((prev) => prev + 1);
                          } else {
                            toast.error("Stock limit reached");
                          }
                        }}
                        disabled={
                          !availableStock ||
                          (cartItem?.quantity || 0) + qty >= availableStock
                        }
                        className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all duration-200",
                          !availableStock ||
                            (cartItem?.quantity || 0) + qty >= availableStock
                            ? "opacity-40 cursor-not-allowed pointer-events-none"
                            : "hover:bg-amber-100 active:scale-90 cursor-pointer pointer-events-auto",
                        )}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 text-amber-700" />
                      </button>
                    </div>

                    {/* {!isOutOfStock && (
                    <span className="text-xs text-gray-500">
                      {availableStock} pcs available
                    </span>
                  )} */}
                  </div>
                </div>
                {/* CTA Buttons */}
                <div className="mt-auto pt-6 border-t border-amber-100">
                  <div className="flex gap-3 flex-wrap">
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="min-w-44 h-12 rounded-full bg-red-50 border-2 border-red-200 text-red-500 text-sm font-bold tracking-wide cursor-not-allowed pointer-events-none flex items-center justify-center"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleAddToCart}
                          className="group cursor-pointer pointer-events-auto flex-1 min-w-44 h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {/* <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" /> */}
                          Add To Cart
                        </button>

                        <button
                          onClick={handleBuyNow}
                          className="group cursor-pointer pointer-events-auto flex-1 min-w-44 h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-md shadow-amber-300 hover:shadow-lg hover:shadow-amber-300 transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {/* <Zap className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:fill-white" /> */}
                          Buy Now
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* watching */}
                {/* <div className="flex items-center gap-2 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                  <Eye className="text-amber-500" size={18} />
                  <span className="text-sm text-gray-600">
                    <b className="text-amber-600">{watchingCount}</b> watching
                    now
                  </span>
                </div> */}

                {/* payment */}
                {/* <div className="flex items-center gap-3 flex-wrap pt-1">
                  <span className="text-sm font-medium text-gray-700">
                    Payment Methods:
                  </span>
                  <Image
                    src={paymentMethodImage}
                    alt="payment"
                    width={400}
                    height={100}
                    className="opacity-90"
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* description */}
        <div className="container mx-auto px-5 py-10">
          <div className="mb-6">
            <span className="inline-flex items-center px-6 py-2.5 rounded-full bg-amber-500 text-white text-sm font-bold uppercase tracking-wider shadow-md shadow-amber-200 transition-all duration-300 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-300 cursor-default select-none">
              Description
            </span>
          </div>
          <div
            className="prose max-w-none prose-p:text-gray-700 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* RECENT PRODUCTS CAROUSEL */}
        {recentProducts.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-900 py-12 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Recently Viewed Products
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore more products from our collection
                </p>
              </div>

              {/* Carousel */}
              <Carousel
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {recentProducts.map((product: any) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/5"
                    >
                      <div className="h-full">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Navigation Buttons */}
                <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-2 border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-400 dark:border-gray-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-lg cursor-pointer pointer-events-auto hidden md:flex" />
                <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-2 border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-400 dark:border-gray-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-lg cursor-pointer pointer-events-auto hidden md:flex" />
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProductDetails;
