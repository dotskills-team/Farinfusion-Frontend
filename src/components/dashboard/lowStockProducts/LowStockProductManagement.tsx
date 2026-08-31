/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Trash2,
  Eye,
  FilePenLine,
  Package,
  TrendingUp,
  Flame,
  Gauge,
  Layers,
  MoreHorizontal,
  Search,
  X,
  RotateCcw,
  ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useGetRankedLowStockProductsQuery,
  useToggleFeaturedMutation,
  useTrashUpdateProductMutation,
} from "@/redux/features/product/product.api";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/redux/features/user/user.api";

const LIMIT = 10;

type TabKey = "hot" | "medium" | "normal";

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "hot", label: "Hot Low Stock", icon: Flame },
  { key: "medium", label: "Medium Low Stock", icon: Gauge },
  { key: "normal", label: "Normal Low Stock", icon: Layers },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white px-5 py-4 transition-all duration-200 hover:border-amber-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900 dark:hover:border-amber-900/40">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-amber-50/0 transition-all duration-300 group-hover:bg-amber-50/30 dark:group-hover:bg-amber-900/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums leading-tight text-gray-900 dark:text-gray-50">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              {sub}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <Badge
        variant="outline"
        className="rounded-full border-red-200 bg-red-50 text-[10px] font-bold text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
      >
        Out of stock
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="rounded-full border-orange-200 bg-orange-50 text-[10px] font-bold text-orange-600 dark:border-orange-900/40 dark:bg-orange-900/10 dark:text-orange-400"
    >
      Low: {stock}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "ACTIVE" ? (
    <Badge
      variant="outline"
      className="flex w-fit items-center gap-1 rounded-full border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
    >
      <CheckCircle2 className="h-2.5 w-2.5" />
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="flex w-fit items-center gap-1 rounded-full border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      <XCircle className="h-2.5 w-2.5" />
      Inactive
    </Badge>
  );
}

function RankBadge({ rank, tab }: { rank: number | null; tab: TabKey }) {
  if (!rank) return <span className="text-xs text-gray-300">—</span>;
  const accent =
    tab === "hot"
      ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
      : tab === "medium"
        ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400"
        : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-[10px] font-bold tabular-nums", accent)}
    >
      #{rank}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl bg-amber-50/60 dark:bg-amber-900/10"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}

export default function LowStockProductManagement() {
  const router = useRouter();
  const [trashProduct] = useTrashUpdateProductMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();
  const { data: user } = useGetMeQuery(undefined);
  const role = user?.data?.role;

  const [localSearch, setLocalSearch] = useState("");
  const [search, setSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("hot");
  const [hotPage, setHotPage] = useState(1);
  const [mediumPage, setMediumPage] = useState(1);
  const [normalPage, setNormalPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, isError, refetch } = useGetRankedLowStockProductsQuery({
    ...(search.trim() && { searchTerm: search.trim() }),
    hotPage,
    hotLimit: LIMIT,
    mediumPage,
    mediumLimit: LIMIT,
    normalPage,
    normalLimit: LIMIT,
  });

  const stats = data?.data?.stats;
  const meta = data?.data?.meta;

  const tabData = {
    hot: data?.data?.hot ?? [],
    medium: data?.data?.medium ?? [],
    normal: data?.data?.normal ?? [],
  };

  const tabMeta = {
    hot: meta?.hot,
    medium: meta?.medium,
    normal: meta?.normal,
  };

  const tabPage = {
    hot: hotPage,
    medium: mediumPage,
    normal: normalPage,
  };

  const setTabPage = {
    hot: setHotPage,
    medium: setMediumPage,
    normal: setNormalPage,
  };

  const products = tabData[activeTab];
  const activeMeta = tabMeta[activeTab];
  const activeTotal =
    activeMeta?.total ??
    (activeTab === "hot"
      ? stats?.hotStockOut
      : activeTab === "medium"
        ? stats?.mediumStockOut
        : stats?.normalStockOut) ??
    products.length;
  const totalPages =
    activeMeta?.totalPage ?? Math.ceil((activeTotal || 0) / LIMIT);
  const page = tabPage[activeTab];

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearch(val);
      setHotPage(1);
      setMediumPage(1);
      setNormalPage(1);
    }, 400);
  };

  const clearSearch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocalSearch("");
    setSearch("");
    setHotPage(1);
    setMediumPage(1);
    setNormalPage(1);
  };

  const handleReset = () => {
    clearSearch();
    setActiveTab("hot");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await trashProduct({ _id: deleteTarget._id as string }).unwrap();
      toast.success(`"${deleteTarget.title}" moved to trash`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to move to trash");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = !!search;

  return (
    <div className="min-h-screen space-y-6 bg-background p-3 md:p-4">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
              Low Stock Products
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Products running low, ranked by recent sales demand
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Low Stock"
          value={(stats?.totalStockOut ?? 0).toLocaleString()}
          icon={Package}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard
          label="Hot"
          value={(stats?.hotStockOut ?? 0).toLocaleString()}
          sub="top selling, restock first"
          icon={Flame}
          accent="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        />
        <StatCard
          label="Medium"
          value={(stats?.mediumStockOut ?? 0).toLocaleString()}
          sub="moderate demand"
          icon={Gauge}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard
          label="Normal"
          value={(stats?.normalStockOut ?? 0).toLocaleString()}
          sub="low or no recent sales"
          icon={Layers}
          accent="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        />
      </div>

      {/* ── Filters: search ── */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-900 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search low stock products by title…"
              value={localSearch}
              onChange={handleSearchInput}
              className="h-10 pl-9 pr-9 rounded-xl border-gray-200 bg-gray-50/60 text-sm focus:border-amber-400 dark:border-gray-700 dark:bg-gray-800/60 dark:focus:border-amber-500 transition-colors"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="group h-10 shrink-0 gap-1.5 rounded-xl border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              Reset
            </Button>
          )}
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {activeTotal} product{activeTotal !== 1 ? "s" : ""} matching filters
            </span>
            {search && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
              >
                <Search className="h-3 w-3" />
                &quot;{search}&quot;
                <button
                  onClick={clearSearch}
                  className="ml-0.5 hover:text-amber-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 dark:border-gray-700/60 dark:bg-gray-900">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count =
            tab.key === "hot"
              ? stats?.hotStockOut
              : tab.key === "medium"
                ? stats?.mediumStockOut
                : stats?.normalStockOut;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-amber-50 hover:text-amber-700 dark:text-gray-400 dark:hover:bg-amber-900/10 dark:hover:text-amber-400",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                )}
              >
                {(count ?? 0).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-gray-900">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex items-center gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
              <Package className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Failed to load low stock products
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-red-500 hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
              <Package className="h-8 w-8 text-amber-300 dark:text-amber-800" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No {activeTab} low stock products
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Try adjusting your search or check another tab
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100/80 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-900/5">
                  {[
                    { label: "Rank", cls: "pl-5 w-16" },
                    { label: "Product", cls: "min-w-[200px]" },
                    { label: "Category", cls: "hidden md:table-cell" },
                    { label: "Price", cls: "text-right" },
                    {
                      label: "Buying",
                      cls: "text-right hidden lg:table-cell",
                    },
                    { label: "Stock", cls: "text-center" },
                    { label: "Sold (Period)", cls: "text-center hidden sm:table-cell" },
                    { label: "Featured", cls: "text-center" },
                    { label: "Status", cls: "hidden sm:table-cell" },
                    { label: "Actions", cls: "text-center pr-5 w-16" },
                  ]
                    .filter(
                      (col) => !(col.label === "Buying" && role !== "ADMIN"),
                    )
                    .map((col) => (
                      <th
                        key={col.label}
                        className={cn(
                          "py-3 text-[10px] font-bold uppercase tracking-widest text-amber-700/60 dark:text-amber-500/60 px-3",
                          col.cls,
                        )}
                      >
                        {col.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product: any, idx: number) => {
                  const sellPrice =
                    product.discountPrice && product.discountPrice > 0
                      ? product.discountPrice
                      : product.price;
                  const hasDiscount =
                    (product?.discountPrice as number) > 0 &&
                    (product?.discountPrice as number) < product.price;
                  return (
                    <tr
                      key={product._id as string}
                      className={cn(
                        "border-b border-gray-100/80 dark:border-gray-800/60 transition-colors duration-100",
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-amber-50/10 dark:bg-amber-900/5",
                        "hover:bg-amber-50/40 dark:hover:bg-amber-900/10",
                      )}
                    >
                      {/* Rank */}
                      <td className="px-3 pl-5 py-3">
                        <RankBadge rank={product.rank} tab={activeTab} />
                      </td>
                      {/* Product */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                sizes="44px"
                                className="object-cover transition-transform duration-300 hover:scale-110"
                              />
                            </div>
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                              <ImageIcon className="h-5 w-5 text-amber-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className="truncate max-w-40 text-sm font-semibold text-gray-900 dark:text-gray-50 leading-snug"
                              title={product.title}
                            >
                              {product.title}
                            </p>
                            {product.size && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                Size: {product.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          {(product.category as any)?.title ?? "—"}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-50">
                            ৳{sellPrice?.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] tabular-nums text-gray-400 line-through">
                              ৳{product.price?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Buying */}
                      {role === "ADMIN" && (
                        <td className="px-3 py-3 text-right hidden lg:table-cell">
                          <span className="text-xs tabular-nums font-medium text-gray-500">
                            {product.buyingPrice
                              ? `৳${product.buyingPrice.toLocaleString()}`
                              : "—"}
                          </span>
                        </td>
                      )}
                      {/* Stock */}
                      <td className="px-3 py-3 text-center">
                        <StockBadge stock={product.availableStock ?? 0} />
                      </td>
                      {/* Sold in period */}
                      <td className="px-3 py-3 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 tabular-nums dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400">
                          <TrendingUp className="h-2.5 w-2.5" />
                          {product.totalSoldInPeriod ?? 0}
                        </span>
                      </td>
                      {/* Featured Toggle */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={async () => {
                            try {
                              await toggleFeatured(product._id).unwrap();
                              toast.success(
                                product.isFeatured
                                  ? "Removed from featured"
                                  : "Added to featured",
                              );
                            } catch (err: any) {
                              toast.error("Failed to update");
                            }
                          }}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
                            product.isFeatured
                              ? "bg-amber-500"
                              : "bg-gray-300 dark:bg-gray-700",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300",
                              product.isFeatured
                                ? "translate-x-6"
                                : "translate-x-1",
                            )}
                          />
                        </button>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <StatusBadge status={product.status ?? "INACTIVE"} />
                      </td>
                      {/* Actions */}
                      <td className="px-3 pr-5 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-gray-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl"
                          >
                            <DropdownMenuItem
                              className="gap-2 text-sm cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/staff/dashboard/admin/product-management/product-details/${product.slug}`,
                                )
                              }
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-500" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-sm cursor-pointer text-amber-600 focus:text-amber-600 dark:text-amber-400"
                              onClick={() =>
                                router.push(
                                  `/staff/dashboard/admin/product-management/update-product/${product.slug}`,
                                )
                              }
                            >
                              <FilePenLine className="h-3.5 w-3.5" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={role !== "ADMIN" && role !== "MANAGER"}
                              className="gap-2 text-sm cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                              onClick={() => {
                                setDeleteTarget(product);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Move to Trash
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination (per active tab) ── */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    page > 1 && setTabPage[activeTab]((p) => p - 1)
                  }
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:text-amber-600"
                  }
                />
              </PaginationItem>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setTabPage[activeTab](pageNum)}
                      isActive={page === pageNum}
                      className={cn(
                        "cursor-pointer",
                        page === pageNum &&
                          "border-amber-400 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-900/20",
                      )}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    page < totalPages && setTabPage[activeTab]((p) => p + 1)
                  }
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:text-amber-600"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-gray-200/80 dark:border-gray-700/60 max-w-md">
          <div className="h-1 w-full rounded-t-2xl bg-linear-to-r from-red-500 via-orange-400 to-red-500 -mt-6 mb-4" />
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              Move to Trash?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                &quot;{deleteTarget?.title}&quot;
              </span>{" "}
              will be moved to trash. You can restore it later from the Trash
              section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={confirmDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white gap-1.5 transition-colors"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Moving…
                </span>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Move to Trash
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}