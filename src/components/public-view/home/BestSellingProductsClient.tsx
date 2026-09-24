
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IProduct } from "@/types";
import { AnalyticsEvents } from "@/lib/analytics";

export function BestSellingProductsClient({
  products,
}: {
  products: IProduct[];
}) {
  const router = useRouter();

  const bestSellingProducts = products;

  if (!bestSellingProducts?.length) return null;

  const handleProductClick = (product: IProduct, index: number) => {
    AnalyticsEvents.selectItem({
      product,
      index,
      listId: "home_products",
      listName: "Home Products",
    });
    router.push(`/product/${product.slug}`);
  };

  const ProductCard = ({
    product,
    index,
  }: {
    product: IProduct;
    index: number;
  }) => (
    <div
      onClick={() => handleProductClick(product, index)}
      className="cursor-pointer bg-white rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square">
        <Image
          src={product.images?.[0]}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-sm">
          {product.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {product.category?.title}
        </p>

        <div className="mt-3">
          {product.discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-600">
                ৳{product.discountPrice}
              </span>

              <span className="text-xs line-through text-gray-400">
                ৳{product.price}
              </span>
            </div>
          ) : (
            <span className="font-bold text-amber-600">
              ৳{product.price}
            </span>
          )}
        </div>

        <button className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white text-sm py-2 rounded-md">
          Add To Cart
        </button>
      </div>
    </div>
  );

  return (
    <section className="py-16 max-w-352 mx-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-10">
          <h2 className="px-4 py-2 text-xl md:text-3xl font-black uppercase tracking-wide">
            Our Best Selling Products
          </h2>
        </div>

        {/* MOBILE: plain grid, no carousel */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {bestSellingProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>

        {/* MD AND UP: carousel */}
        <div className="hidden md:block">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {bestSellingProducts.map((product, index) => (
                <CarouselItem
                  key={product._id}
                  className="md:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard product={product} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="lg:-left-4 left-1" />
            <CarouselNext className="lg:-right-4 right-1" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}