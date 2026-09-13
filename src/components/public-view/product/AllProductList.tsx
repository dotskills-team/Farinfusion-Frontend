/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { useGetAllBrandsQuery } from "@/redux/features/brand/brand.api";
import CategoryByProductCard from "@/components/public-view/common/CategoryByProductCard";
import ProductSkeleton from "@/components/public-view/common/ProductSkeleton";
import { IProduct } from "@/types";
import { setViewMode } from "@/redux/slices/viewModeSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

const SORT_OPTIONS = [
  { value: "default", label: "Default sorting" },
  { value: "-createdAt", label: "Newest first" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-totalSold", label: "Popularity" },
  { value: "-ratings", label: "Rating" },
];

// ─── Pagination ───────────────────────────────────────────────────────────────

function ShopPagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const range = 2;
  for (
    let i = Math.max(1, page - range);
    i <= Math.min(totalPages, page + range);
    i++
  )
    pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-amber-400 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400 transition-colors"
      >
        ‹
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPage(1)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 hover:border-amber-400 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400 transition-colors"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-gray-400 px-1">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
            p === page
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400",
          )}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-gray-400 px-1">…</span>
          )}
          <button
            onClick={() => onPage(totalPages)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 hover:border-amber-400 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-amber-400 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400 transition-colors"
      >
        ›
      </button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({
  priceRange,
  onPriceChange,
  onPriceApply,
  brands,
  selectedBrand,
  onBrandChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  priceRange: [number, number];
  onPriceChange: (v: [number, number]) => void;
  onPriceApply: () => void;
  brands: any[];
  selectedBrand: string;
  onBrandChange: (id: string) => void;
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Price filter */}
      <Card className="shadow-sm border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Filter By Price
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={priceRange}
            onValueChange={(v) => onPriceChange(v as [number, number])}
            className="[**:[[role=slider]]:bg-amber-500 **:[[role=slider]]:border-amber-500"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                ৳{priceRange[0]}
              </span>
              <span className="mx-1 text-gray-400">—</span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                ৳{priceRange[1]}
              </span>
            </p>
            <Button
              size="sm"
              onClick={onPriceApply}
              className="h-7 rounded-full bg-amber-500 px-3 text-xs text-white hover:bg-amber-600 shadow-sm"
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brand + Category accordion */}
      <Card className="overflow-hidden shadow-sm border-gray-100 dark:border-gray-800">
        <CardContent className="p-0">
          <Accordion
            type="multiple"
            defaultValue={["brands", "categories"]}
            className="w-full"
          >
            {/* Brands */}
            <AccordionItem value="brands" className="border-b border-gray-100 dark:border-gray-800">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors [&>svg]:text-amber-500">
                Filter By Brands
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3 pt-1">
                <ScrollArea className="max-h-60">
                  <div className="space-y-0.5 px-2">
                    <button
                      onClick={() => onBrandChange("")}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all cursor-pointer text-left",
                        !selectedBrand
                          ? "bg-amber-50 font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", !selectedBrand ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600")} />
                      All Brands
                    </button>
                    {brands?.map((brand: any) => (
                      <button
                        key={brand.slug}
                        onClick={() => onBrandChange(brand.slug)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all cursor-pointer text-left",
                          selectedBrand === brand.slug
                            ? "bg-amber-50 font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : "text-gray-600 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400",
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", selectedBrand === brand.slug ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600")} />
                        {brand.title}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>

            {/* Categories */}
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors [&>svg]:text-amber-500">
                Filter By Categories
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3 pt-1">
                <ScrollArea className="max-h-60">
                  <div className="space-y-0.5 px-2">
                    <button
                      onClick={() => onCategoryChange("")}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all cursor-pointer text-left",
                        !selectedCategory
                          ? "bg-amber-50 font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", !selectedCategory ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600")} />
                      All Categories
                    </button>
                    {categories?.map(
                      (category: any) =>
                        category.productCount > 0 && (
                          <button
                            key={category._id}
                            onClick={() => onCategoryChange(category.slug)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all cursor-pointer text-left",
                              selectedCategory === category.slug
                                ? "bg-amber-50 font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                : "text-gray-600 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400",
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", selectedCategory === category.slug ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600")} />
                            {category.title}
                          </button>
                        ),
                    )}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [sort, setSort] = useState("default");
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.viewMode.viewMode);

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [appliedPrice, setAppliedPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const searchQuery = searchParams.get("search") ?? "";
  const brandQuery = searchParams.get("brand") ?? "";
  const categoryQuery = searchParams.get("category") ?? "";

  const [selectedBrand, setSelectedBrand] = useState(brandQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);

  // ── Query args ─────────────────────────────────────────────────────────────
  const queryArgs: any = {
    page,
    limit: perPage,
    ...(sort !== "default" && { sort }),
    ...(searchQuery && { searchTerm: searchQuery }),
    ...(selectedBrand && { brand: selectedBrand }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(appliedPrice[0] > PRICE_MIN && { "price[gte]": appliedPrice[0] }),
    ...(appliedPrice[1] < PRICE_MAX && { "price[lte]": appliedPrice[1] }),
  };

  const { data: productsData, isLoading, isError } = useGetAllProductsQuery(queryArgs);
  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });

  const rawProducts: IProduct[] = useMemo(() =>  productsData?.data ?? [], [productsData?.data]);
  const totalCount = productsData?.meta?.total ?? 0;
  const totalPages = productsData?.meta?.totalPage ?? Math.ceil(totalCount / perPage);
  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  // ── Sort: in-stock products always float to top ────────────────────────────
  const products = useMemo<IProduct[]>(() => {
    return [...rawProducts].sort((a, b) => {
      const aInStock = (a.availableStock ?? 0) > 0 ? 0 : 1;
      const bInStock = (b.availableStock ?? 0) > 0 ? 0 : 1;
      return aInStock - bInStock;
    });
  }, [rawProducts]);

  const showing1 = totalCount === 0 ? 0 : (page - 1) * perPage + 1;
  const showing2 = Math.min(page * perPage, totalCount);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const buildParams = useCallback(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  const handlePriceApply = useCallback(() => {
    setAppliedPrice(priceRange);
    setPage(1);

    const params = buildParams();
    params.delete("brand");
    params.delete("category");

    if (priceRange[0] > PRICE_MIN) params.set("price[gte]", String(priceRange[0]));
    else params.delete("price[gte]");

    if (priceRange[1] < PRICE_MAX) params.set("price[lte]", String(priceRange[1]));
    else params.delete("price[lte]");

    router.push(`/shop?${params.toString()}`);
  }, [priceRange, router, buildParams]);

  const handleBrandChange = useCallback(
    (slug: string) => {
      setSelectedBrand(slug);
      setSelectedCategory("");
      setPage(1);

      const params = buildParams();
      if (slug) params.set("brand", slug);
      else params.delete("brand");
      params.delete("category");

      router.push(`/shop?${params.toString()}`);
    },
    [router, buildParams],
  );

  const handleCategoryClick = useCallback(
    (slug: string) => {
      const next = selectedCategory === slug ? "" : slug;
      setSelectedCategory(next);
      setSelectedBrand("");
      setPage(1);

      const params = buildParams();
      if (next) params.set("category", next);
      else params.delete("category");
      params.delete("brand");

      router.push(`/shop?${params.toString()}`);
    },
    [selectedCategory, router, buildParams],
  );

  const handleClearAll = useCallback(() => {
    setSelectedBrand("");
    setSelectedCategory("");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setAppliedPrice([PRICE_MIN, PRICE_MAX]);
    setPage(1);
    router.push("/shop");
  }, [router]);

  const hasActiveFilters =
    !!selectedBrand ||
    !!selectedCategory ||
    appliedPrice[0] > PRICE_MIN ||
    appliedPrice[1] < PRICE_MAX;

  // ── Sync URL params ─────────────────────────────────────────────────────────
  useEffect(() => { setSelectedCategory(categoryQuery); }, [categoryQuery]);
  useEffect(() => { setSelectedBrand(brandQuery); }, [brandQuery]);

  // ── Sidebar props ──────────────────────────────────────────────────────────
  const sidebarProps = {
    priceRange,
    onPriceChange: setPriceRange,
    onPriceApply: handlePriceApply,
    brands,
    selectedBrand,
    onBrandChange: handleBrandChange,
    categories,
    selectedCategory,
    onCategoryChange: handleCategoryClick,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Breadcrumb + count ──────────────────────────────────────────── */}
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-gray-50">Shop</span>
            {searchQuery && (
              <>
                <span>/</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  &quot;{searchQuery}&quot;
                </span>
              </>
            )}
          </nav>
          {totalCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {showing1}–{showing2}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {totalCount}
              </span>{" "}
              results
            </p>
          )}
        </div>

        {/* ── Category pill scroll row (shadcn ScrollArea) ─────────────────── */}
        {categories.length > 0 && (
          <div className="mb-6">
            <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
              <div className="flex gap-3 px-0.5 pb-3 pt-0.5">
                {categories.map(
                  (cat: any) =>
                    cat.productCount > 0 && (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className={cn(
                          "group inline-flex flex-col items-center gap-2 rounded-xl p-3 text-center cursor-pointer",
                          "transition-all duration-200 shrink-0 w-22.5",
                          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                          selectedCategory === cat.slug
                            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300 dark:ring-amber-700"
                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-200 hover:bg-amber-50/60 dark:hover:bg-amber-900/10 shadow-sm hover:shadow-md",
                        )}
                      >
                        <div
                          className={cn(
                            "relative h-14 w-14 overflow-hidden rounded-xl transition-transform duration-200",
                            "group-hover:scale-105",
                            selectedCategory === cat.slug ? "scale-105" : "",
                          )}
                        >
                          {cat.image?.[0] ? (
                            <Image
                              src={cat.image}
                              alt={cat.title ?? ""}
                              fill
                              priority
                              quality={80}
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300 text-xs rounded-xl">
                              ?
                            </div>
                          )}
                        </div>

                        <p
                          className={cn(
                            "text-[11px] font-semibold leading-tight whitespace-normal text-center",
                            selectedCategory === cat.slug
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {cat.title}
                        </p>

                        {cat.productCount !== undefined && (
                          <p className="text-[10px] text-gray-400 leading-none -mt-1">
                            {cat.productCount}
                          </p>
                        )}
                      </button>
                    ),
                )}
              </div>
              {/* The ScrollBar must be horizontal and visible */}
              <ScrollBar orientation="horizontal" className="h-1.5" />
            </ScrollArea>
          </div>
        )}

        {/* ── Main layout: Sidebar + Products ────────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* ── Desktop Sidebar — sticky ─────────────────────────────────── */}
          <aside
            className="hidden lg:block w-52 xl:w-60 shrink-0 sticky top-20 self-start max-h-[calc(100dvh-6rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent dark:scrollbar-thumb-gray-700 rounded-xl pb-4"
          >
            <SidebarContent {...sidebarProps} />
          </aside>

          {/* ── Products column ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Shop header bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700/60 dark:bg-gray-900 shadow-sm">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-gray-50">
                  Shop
                </h1>

                {/* Mobile filter sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-1.5 rounded-lg text-xs h-8"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white font-bold">
                          !
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-4 overflow-y-auto">
                    <h2 className="mb-4 text-base font-bold">Filters</h2>
                    <SidebarContent {...sidebarProps} />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Per-page selector */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>Show:</span>
                  {[9, 12, 18, 24].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPerPage(n); setPage(1); }}
                      className={cn(
                        "h-7 w-7 rounded text-xs font-medium transition-colors",
                        perPage === n
                          ? "bg-amber-500 text-white"
                          : "text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* View toggles */}
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
                  {/* List */}
                  <button
                    onClick={() => dispatch(setViewMode("list"))}
                    title="List view"
                    className={cn(
                      "rounded p-1.5 transition-colors",
                      viewMode === "list"
                        ? "bg-amber-500 text-white"
                        : "text-gray-400 hover:text-amber-500",
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>

                  {/* Grid 3 */}
                  <button
                    onClick={() => dispatch(setViewMode("grid-3"))}
                    title="3-column grid"
                    className={cn(
                      "rounded p-1.5 transition-colors",
                      viewMode === "grid-3"
                        ? "bg-amber-500 text-white"
                        : "text-gray-400 hover:text-amber-500",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>

                  {/* Grid 4 */}
                  <button
                    onClick={() => dispatch(setViewMode("grid-4"))}
                    title="4-column grid"
                    className={cn(
                      "rounded p-1.5 transition-colors",
                      viewMode === "grid-4"
                        ? "bg-amber-500 text-white"
                        : "text-gray-400 hover:text-amber-500",
                    )}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="0" width="4" height="4" rx="0.5" />
                      <rect x="6" y="0" width="4" height="4" rx="0.5" />
                      <rect x="12" y="0" width="4" height="4" rx="0.5" />
                      <rect x="0" y="6" width="4" height="4" rx="0.5" />
                      <rect x="6" y="6" width="4" height="4" rx="0.5" />
                      <rect x="12" y="6" width="4" height="4" rx="0.5" />
                      <rect x="0" y="12" width="4" height="4" rx="0.5" />
                      <rect x="6" y="12" width="4" height="4" rx="0.5" />
                      <rect x="12" y="12" width="4" height="4" rx="0.5" />
                    </svg>
                  </button>
                </div>

                {/* Sort */}
                <Select
                  value={sort}
                  onValueChange={(v) => { setSort(v); setPage(1); }}
                >
                  <SelectTrigger className="h-9 w-44 rounded-lg border-gray-200 bg-gray-50/60 text-xs dark:border-gray-700 dark:bg-gray-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        className="cursor-pointer text-sm"
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Active filter chips ──────────────────────────────────── */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                    Brand: {brands.find((b: any) => b.slug === selectedBrand)?.title ?? selectedBrand}
                    <button
                      onClick={() => handleBrandChange("")}
                      className="ml-0.5 rounded-full hover:text-amber-900 dark:hover:text-amber-200"
                      aria-label="Remove brand filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                    Category: {categories.find((c: any) => c.slug === selectedCategory)?.title ?? selectedCategory}
                    <button
                      onClick={() => handleCategoryClick("")}
                      className="ml-0.5 rounded-full hover:text-amber-900 dark:hover:text-amber-200"
                      aria-label="Remove category filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(appliedPrice[0] > PRICE_MIN || appliedPrice[1] < PRICE_MAX) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                    ৳{appliedPrice[0]} — ৳{appliedPrice[1]}
                    <button
                      onClick={() => { setPriceRange([PRICE_MIN, PRICE_MAX]); setAppliedPrice([PRICE_MIN, PRICE_MAX]); setPage(1); }}
                      className="ml-0.5 rounded-full hover:text-amber-900 dark:hover:text-amber-200"
                      aria-label="Remove price filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ── Product grid / states ────────────────────────────────── */}
            {isLoading ? (
              <ProductSkeleton />
            ) : isError ? (
              <p className="text-center text-red-500 py-12">
                Something went wrong. Please try again.
              </p>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-3xl select-none">
                  🔍
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  No products found
                </p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters or search term
                </p>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAll}
                    className="mt-2 rounded-full border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === "grid-3"
                    ? "grid-cols-2 xl:grid-cols-3"
                    : viewMode === "grid-4"
                      ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1",
                )}
              >
                {products.map((product) => (
                  <CategoryByProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* ── Pagination ──────────────────────────────────────────── */}
            <ShopPagination
              page={page}
              totalPages={totalPages}
              onPage={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}