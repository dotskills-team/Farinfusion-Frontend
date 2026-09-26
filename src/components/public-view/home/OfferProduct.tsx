"use client"
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {useGetAllProductsQuery} from "@/redux/features/product/product.api";
import {useRouter} from "next/navigation";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

const countdownItems = [
  { label: "Days", value: "0" },
  { label: "Hour", value: "00" },
  { label: "Min", value: "00" },
  { label: "Sec", value: "00" },
];



const OfferProduct = () => {
  const router = useRouter();
  const {data} = useGetAllProductsQuery({});
  const offerProducts = data?.data;

  return (
      <section className="w-full bg-[#e8edf5] py-8" >
        <div className="max-w-352 container mx-auto px-5">
          <div className="grid gap-6 md:grid-cols-[44%_56%]">
            <div className="overflow-hidden rounded-2xl">
              <Image
                  src="/assets/medicube3.webp"
                  alt="Featured self-care product"
                  width={500}
                  height={500}
                  className="h-full min-h-65 w-full object-cover"
                  priority
              />
            </div>

            <div className="flex flex-col justify-center px-0 md:px-5">
              <h2 className="text-center text-3xl font-bold heading-animate">
                Self-Care, Redefined
              </h2>
              <p className="mt-2  text-center text-sm leading-6 text-gray-600">
                Pamper yourself with refined beauty essentials that bring spa-like
                freshness and relaxation into your everyday life.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {countdownItems.map((item) => (
                    <Card
                        key={item.label}
                        className="w-16.5 items-center gap-1 rounded-md border border-slate-200 bg-white px-0 py-2 text-center shadow-none"
                    >
                  <span className="text-xl font-semibold leading-none text-gray-800">
                    {item.value}
                  </span>
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </Card>
                ))}
              </div>

              <div className="mt-5 flex justify-center">
                <Button
                    onClick={() => router.push("/shop")}
                    className="h-9 rounded-md cursor-pointer bg-amber-500 px-4 text-sm font-medium text-white hover:bg-amber-600">
                  Go Shopping <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Carousel
              opts={{ loop: true }}
              className="w-full mt-6 relative"
          >
            <CarouselContent>
              {offerProducts?.slice(0, 5)?.map((item, i) => {
                const imageSrc = Array.isArray(item?.category[0]?.image)
                    ? item?.category[0]?.image[0]
                    : item?.category[0]?.image || "/placeholder.png";
                return (
                    <>
                      <CarouselItem
                          key={i}
                          className="basis-1/2 sm:basis-1/3 lg:basis-1/5"
                      >
                        <Card
                            onClick={() =>
                                router.push(`/shop?category=${item?.category[0]?.slug}`)
                            }
                            className="flex-row items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-none 
                            cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg "
                        >

                          <Image
                              onClick={() =>
                                  router.push(`/shop?category=${item?.category[0]?.slug}`)
                              }
                              src={imageSrc}
                              alt={item.category[0]?.title}
                              width={500}
                              height={500}
                              priority
                              className="h-20 w-20 rounded-md object-cover mt-2 cursor-pointer"
                          />

                          <div className="min-w-0">
                            <h3
                                onClick={() =>
                                    router.push(`/shop?category=${item?.category[0]?.slug}`)
                                }
                                className="truncate text-sm font-semibold text-gray-800 cursor-pointer"
                            >
                              {item.category[0]?.title}
                            </h3>

                            {/* rating */}
                            <div className="mt-0.5 flex items-center gap-0.5 text-slate-300">
                              {Array.from({ length: 5 }).map((_, index) => (
                                  <Star key={index} className="size-3 fill-current" />
                              ))}
                            </div>

                            {/* price */}
                            <div className="mt-1 text-xs">
                              {item?.discountPrice ? (
                                  <>
                              <span className="text-gray-400 line-through mr-1">
                                ৳{item.price}
                              </span>
                                    <span className="font-semibold text-amber-600">
                                ৳{item.discountPrice}
                              </span>
                                  </>
                              ) : (
                                  <span className="font-semibold text-gray-800">
                              ৳{item.price}
                            </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </CarouselItem>
                    </>
                )
              })}
            </CarouselContent>

            {/* arrows */}
            <CarouselPrevious
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                  h-8 w-8 sm:h-10 sm:w-10
                  bg-white/90 backdrop-blur border shadow
                  hover:bg-white"
            />

            <CarouselNext
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                      h-8 w-8 sm:h-10 sm:w-10
                      bg-white/90 backdrop-blur border shadow
                      hover:bg-white"
            />
          </Carousel>
        </div>
      </section>
  );
};

export default OfferProduct;