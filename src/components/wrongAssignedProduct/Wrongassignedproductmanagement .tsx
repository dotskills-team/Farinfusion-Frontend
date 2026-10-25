/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import {
    Plus,
    Trash2,
    PackageX,
    Warehouse,
    Truck,
    MoreHorizontal,
    Search,
    X,
    SlidersHorizontal,
    RotateCcw,
    ImageIcon,
    AlertTriangle,
    Undo2,
    PackageCheck,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import { IProduct } from "@/types";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import {
    IWrongAssignedProduct,
    WrongProductStatus,
    useDeleteWrongAssignedProductMutation,
    useGetAllWrongAssignedProductsQuery,
    useUpdateWrongAssignedProductMutation,
} from "@/redux/features/wrongAssignedProduct/wrongAssignedProduct.api";
import CreateWrongAssignedProductModal from "./Createwrongassignedproductmodal";

const LIMIT = 10;

// An OUTSIDE record older than this many days is highlighted as "stuck"
const STUCK_DAYS = 7;

const CREATE_PAGE_URL =
    "/staff/dashboard/admin/wrong-assigned-products/create";

const SORT_OPTIONS = [
    { value: "-createdAt", label: "Newest first" },
    { value: "createdAt", label: "Oldest first" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "OUTSIDE", label: "Outside" },
    { value: "IN_WAREHOUSE", label: "In Warehouse" },
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

function StatusBadge({ status }: { status: WrongProductStatus }) {
    return status === "IN_WAREHOUSE" ? (
        <Badge
            variant="outline"
            className="flex w-fit items-center gap-1 rounded-full border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
        >
            <Warehouse className="h-2.5 w-2.5" />
            In Warehouse
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="flex w-fit items-center gap-1 rounded-full border-orange-200 bg-orange-50 text-[10px] font-bold text-orange-600 dark:border-orange-900/40 dark:bg-orange-900/10 dark:text-orange-400"
        >
            <Truck className="h-2.5 w-2.5" />
            Outside
        </Badge>
    );
}

function ProductCell({ product }: { product?: IProduct }) {
    if (!product) return <span className="text-gray-400">—</span>;
    return (
        <div className="flex items-center gap-2.5">
            {product.images?.[0] ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <ImageIcon className="h-4 w-4 text-amber-300" />
                </div>
            )}
            <p
                className="max-w-40 truncate text-sm font-medium text-gray-900 dark:text-gray-50"
                title={product.title}
            >
                {product.title}
            </p>
        </div>
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

export default function WrongAssignedProductManagement() {
    const { data: user } = useGetMeQuery(undefined);
    const role = user?.data?.role;
    const canManage = !!role && ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role);
    const canDelete = !!role && ["ADMIN", "SUPER_ADMIN"].includes(role);

    const [localSearch, setLocalSearch] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("-createdAt");
    const [page, setPage] = useState(1);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<IWrongAssignedProduct | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [updateRecord] = useUpdateWrongAssignedProductMutation();
    const [deleteRecord] = useDeleteWrongAssignedProductMutation();
    const [createOpen, setCreateOpen] = useState(false);

    const { data, isLoading, isError, refetch } =
        useGetAllWrongAssignedProductsQuery({
            ...(search.trim() && { searchTerm: search.trim() }),
            ...(status && { status }),
            sort,
            page,
            limit: LIMIT,
        });

    const records: IWrongAssignedProduct[] = data?.data?.data ?? [];
    const stats = data?.data?.stats;
    const meta = data?.meta;
    const totalCount = meta?.total ?? records.length;
    const totalPages = meta?.totalPage ?? Math.ceil(totalCount / LIMIT);

    const hasFilters = !!search || !!status || sort !== "-createdAt";

    // Debounced search input
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 400);
    };

    const clearSearch = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setLocalSearch("");
        setSearch("");
        setPage(1);
    };

    const handleReset = () => {
        clearSearch();
        setStatus("");
        setSort("-createdAt");
        setPage(1);
    };

    const handleStatusChange = async (
        record: IWrongAssignedProduct,
        next: WrongProductStatus,
    ) => {
        try {
            await updateRecord({ _id: record._id, status: next }).unwrap();
            toast.success(
                next === "IN_WAREHOUSE"
                    ? "Marked as received in warehouse"
                    : "Marked as outside",
            );
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update status");
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteRecord(deleteTarget._id).unwrap();
            toast.success("Record deleted");
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete record");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen space-y-6 bg-background p-3 md:p-4">
            {/* ── Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                            <PackageX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
                            Wrong Assigned Products
                        </h1>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        Track products that were sent by mistake until they are back in the
                        warehouse
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="gap-2 rounded-md bg-amber-500 text-white hover:cursor-pointer hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Report Wrong Product
                </Button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                    label="Total Reported"
                    value={stats?.total ?? 0}
                    icon={PackageX}
                    accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                />
                <StatCard
                    label="Still Outside"
                    value={stats?.OUTSIDE ?? 0}
                    sub="not yet back in warehouse"
                    icon={Truck}
                    accent={
                        (stats?.OUTSIDE ?? 0) > 0
                            ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                            : "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }
                />
                <StatCard
                    label="Back In Warehouse"
                    value={stats?.IN_WAREHOUSE ?? 0}
                    sub={`${stats?.total
                        ? Math.round((stats.IN_WAREHOUSE / stats.total) * 100)
                        : 0
                        }% of total`}
                    icon={Warehouse}
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                />
            </div>

            {/* ── Filters ── */}
            <div className="space-y-3 rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative min-w-50 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by order number or notes…"
                            value={localSearch}
                            onChange={handleSearchInput}
                            className="h-10 rounded-xl border-gray-200 bg-gray-50/60 pl-9 pr-9 text-sm focus:border-amber-400 dark:border-gray-700 dark:bg-gray-800/60"
                        />
                        {localSearch && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
                        <Select
                            value={status || "all"}
                            onValueChange={(v) => {
                                setStatus(v === "all" ? "" : v);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-10 w-40 rounded-xl border-gray-200 bg-gray-50/60 text-sm dark:border-gray-700 dark:bg-gray-800/60">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem
                                        key={s.value}
                                        value={s.value}
                                        className="cursor-pointer text-sm"
                                    >
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={sort}
                        onValueChange={(v) => {
                            setSort(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 bg-gray-50/60 text-sm dark:border-gray-700 dark:bg-gray-800/60">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {SORT_OPTIONS.map((s) => (
                                <SelectItem
                                    key={s.value}
                                    value={s.value}
                                    className="cursor-pointer text-sm"
                                >
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="group h-10 shrink-0 gap-1.5 rounded-xl border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 dark:border-gray-700 dark:text-gray-400"
                        >
                            <RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-gray-900">
                {isLoading ? (
                    <TableSkeleton />
                ) : isError ? (
                    <div className="flex items-center gap-3 p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
                            <PackageX className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                Failed to load records
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                            <PackageCheck className="h-8 w-8 text-amber-300 dark:text-amber-800" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            No wrong assigned products found
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Adjust your filters or report a new one
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-amber-100/80 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-900/5">
                                    {[
                                        { label: "Order", cls: "pl-5" },
                                        { label: "Should Have Sent", cls: "min-w-[180px]" },
                                        { label: "Wrongly Sent", cls: "min-w-[180px]" },
                                        { label: "Qty", cls: "text-center" },
                                        { label: "Status", cls: "" },
                                        { label: "Time", cls: "text-center" },
                                        { label: "Reported By", cls: "hidden lg:table-cell" },
                                        { label: "Actions", cls: "w-16 pr-5 text-center" },
                                    ].map((col) => (
                                        <th
                                            key={col.label}
                                            className={cn(
                                                "px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-700/60 dark:text-amber-500/60",
                                                col.cls,
                                            )}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record, idx) => {
                                    const isOutside = record.status === "OUTSIDE";
                                    const daysOutside = differenceInDays(
                                        new Date(),
                                        new Date(record.createdAt),
                                    );
                                    const isStuck = isOutside && daysOutside >= STUCK_DAYS;

                                    return (
                                        <tr
                                            key={record._id}
                                            className={cn(
                                                "border-b border-gray-100/80 transition-colors duration-100 dark:border-gray-800/60",
                                                idx % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-amber-50/10 dark:bg-amber-900/5",
                                                "hover:bg-amber-50/40 dark:hover:bg-amber-900/10",
                                            )}
                                        >
                                            {/* Order */}
                                            <td className="px-3 py-3 pl-5">
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                                                    {record.orderNumber}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                                                </p>
                                            </td>

                                            {/* Intended product */}
                                            <td className="px-3 py-3">
                                                <ProductCell product={record.intendedProduct} />
                                            </td>

                                            {/* Wrong product */}
                                            <td className="px-3 py-3">
                                                <ProductCell product={record.wrongProduct} />
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-3 py-3 text-center font-semibold tabular-nums">
                                                {record.quantity}
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3">
                                                <StatusBadge status={record.status} />
                                            </td>

                                            {/* Time outside / received date */}
                                            <td className="px-3 py-3 text-center">
                                                {isOutside ? (
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tabular-nums",
                                                            isStuck
                                                                ? "border border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
                                                                : "border border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
                                                        )}
                                                        title={isStuck ? "Outside for too long" : undefined}
                                                    >
                                                        {isStuck && <AlertTriangle className="h-2.5 w-2.5" />}
                                                        {daysOutside}d outside
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-500">
                                                        {record.receivedAt
                                                            ? format(new Date(record.receivedAt), "MMM d, yyyy")
                                                            : "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Reported by */}
                                            <td className="hidden px-3 py-3 lg:table-cell">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {record.reportedBy?.name ?? "—"}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {record.reportedBy?.role}
                                                </p>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3 pr-5 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-xl text-gray-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-56 rounded-xl"
                                                    >
                                                        {isOutside ? (
                                                            <DropdownMenuItem
                                                                disabled={!canManage}
                                                                className="cursor-pointer gap-2 text-sm text-emerald-600 focus:text-emerald-600"
                                                                onClick={() =>
                                                                    handleStatusChange(record, "IN_WAREHOUSE")
                                                                }
                                                            >
                                                                <Warehouse className="h-3.5 w-3.5" />
                                                                Mark as in warehouse
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                disabled={!canManage}
                                                                className="cursor-pointer gap-2 text-sm text-orange-600 focus:text-orange-600"
                                                                onClick={() =>
                                                                    handleStatusChange(record, "OUTSIDE")
                                                                }
                                                            >
                                                                <Undo2 className="h-3.5 w-3.5" />
                                                                Mark as outside
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            disabled={!canDelete}
                                                            className="cursor-pointer gap-2 text-sm text-red-600 focus:text-red-600 dark:text-red-400"
                                                            onClick={() => {
                                                                setDeleteTarget(record);
                                                                setDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
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

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => page > 1 && setPage((p) => p - 1)}
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
                                            onClick={() => setPage(pageNum)}
                                            isActive={page === pageNum}
                                            className={cn(
                                                "cursor-pointer",
                                                page === pageNum &&
                                                "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
                                            )}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => page < totalPages && setPage((p) => p + 1)}
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

            <CreateWrongAssignedProductModal
                open={createOpen}
                onOpenChange={setCreateOpen}
            />

            {/* ── Delete confirmation ── */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-md rounded-2xl border-gray-200/80 dark:border-gray-700/60">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-bold">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </div>
                            Delete this record?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                            The wrong product record for order{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {deleteTarget?.orderNumber}
                            </span>{" "}
                            will be removed from this list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={confirmDelete}
                            className="gap-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}