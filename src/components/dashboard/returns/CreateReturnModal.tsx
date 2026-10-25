/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  X,
  Search,
  Package,
  MapPin,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { useCreateReturnMutation } from "@/redux/features/return/returnApi";
import { useGetAllOrdersQuery } from "@/redux/features/orders/ordersApi";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IProduct } from "@/types";

interface ReturnProduct {
  product: string;
  quantity?: number;
  reason: string;
  shouldRestock?: boolean;
  isDamaged?: boolean;
  notes?: string;
}

interface CreateReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: IProduct[];
  onSuccess: () => void;
}

// Orders eligible for a return
const ELIGIBLE_ORDER_STATUSES = [
  "CONFIRMED",
  "PARTIAL",
  // "COMPLETED",
  "CANCELLED",
];

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  open,
  onOpenChange,
  products,
  onSuccess,
}) => {
  const [createReturn, { isLoading }] = useCreateReturnMutation();
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedOrderObj, setSelectedOrderObj] = useState<any>(null);
  const [returnedProducts, setReturnedProducts] = useState<ReturnProduct[]>([]);
  const [refundAmount, setRefundAmount] = useState<number | undefined>(
    undefined,
  );
  const [refundStatus, setRefundStatus] = useState<string>("PENDING");
  const [notes, setNotes] = useState<string>("");
  const [productSearchMap, setProductSearchMap] = useState<
    Record<number, string>
  >({});
  const [productDropdownOpen, setProductDropdownOpen] = useState<
    Record<number, boolean>
  >({});
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the order search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedOrderSearch(orderSearch.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [orderSearch]);

  // Only query the backend while the dropdown is actually open (and while modal is open)
  const { data: ordersData, isFetching: ordersLoading } = useGetAllOrdersQuery(
    {
      ...(debouncedOrderSearch && { searchTerm: debouncedOrderSearch }),
      limit: 15,
    },
    { skip: !open || !dropdownOpen },
  );

  const eligibleOrders = useMemo(() => {
    const rawOrders = ordersData?.data || [];

    return rawOrders.filter((order: any) => {
      const isEligibleOrderStatus = ELIGIBLE_ORDER_STATUSES.includes(
        order.orderStatus,
      );
      const hasProducts = order.products?.length > 0;
      const notDeleted = !order.isDeleted;

      const totalQty = (order.products || []).reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0,
      );
      const hasRemainingReturnQty =
        (order.totalReturnedQuantity || 0) < totalQty;

      return (
        isEligibleOrderStatus &&
        hasProducts &&
        notDeleted &&
        hasRemainingReturnQty
      );
    });
  }, [ordersData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleAddProduct = () => {
    setReturnedProducts([
      ...returnedProducts,
      {
        product: "",
        quantity: undefined,
        reason: "COURIER_RETURN",
        shouldRestock: true,
        isDamaged: false,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setReturnedProducts(returnedProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const updated = [...returnedProducts];
    (updated[index] as any)[field] = value;
    setReturnedProducts(updated);
  };

  const updateProductSearch = (index: number, value: string) => {
    setProductSearchMap((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const updateProductDropdown = (index: number, open: boolean) => {
    setProductDropdownOpen((prev) => ({
      ...prev,
      [index]: open,
    }));
  };

  // Resolve product display info whether `item.product` came back populated
  // (an object) or as a bare id (string), falling back to the products list.
  const getProductInfo = (item: any) => {
    const populated =
      item?.product && typeof item.product === "object" ? item.product : null;

    const productId = populated?._id ?? item?.product;

    const fallback = !populated
      ? products.find((p) => p._id === productId)
      : null;

    const source = populated || fallback;

    return {
      id: productId as string,
      title: source?.title || "Unknown Product",
      sku: (source as any)?.sku || "",
      images: (source as any)?.images || [],
    };
  };

  const orderProducts = Array.isArray(selectedOrderObj?.products)
    ? selectedOrderObj.products
    : [];

  const getFilteredOrderProducts = (index: number) => {
    const search = (productSearchMap[index] || "").toLowerCase();

    if (!search) return orderProducts;

    return orderProducts.filter((item: any) => {
      const info = getProductInfo(item);
      return (
        info.title.toLowerCase().includes(search) ||
        info.sku.toLowerCase().includes(search) ||
        info.id?.toLowerCase().includes(search)
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast.error("Please select an order");
      return;
    }

    if (returnedProducts.length === 0) {
      toast.error("Please add at least one returned product");
      return;
    }

    for (const product of returnedProducts) {
      if (
        !product.product ||
        product.quantity === undefined ||
        product.quantity < 1
      ) {
        toast.error("Please fill all product details");
        return;
      }
    }

    try {
      const result = await createReturn({
        order: selectedOrder,
        returnedProducts,
        refundAmount,
        refundStatus:
          refundAmount !== undefined && refundAmount > 0
            ? refundStatus
            : "NOT_REQUIRED",
        notes,
      }).unwrap();
     console.log("Create return result:", result);
      if (result) {
        toast.success("Return created successfully");
        resetForm();
        onSuccess();
      }
    } catch (error: any) {

      console.log("Error creating return:", error);
      toast.error(error?.data?.message || "Failed to create return");
    }
  };

  const resetForm = () => {
    setSelectedOrder("");
    setSelectedOrderObj(null);
    setReturnedProducts([]);
    setRefundAmount(undefined);
    setRefundStatus("PENDING");
    setNotes("");
    setProductSearchMap({});
    setProductDropdownOpen({});
    setOrderSearch("");
    setDebouncedOrderSearch("");
    onOpenChange(false);
  };

  const selectedOrderDisplay = selectedOrderObj;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="h-1 w-full bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500" />

        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Create Return Parcel
          </DialogTitle>
          <DialogDescription>
            Create a new return for customer ordered products
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
            {/* Smart Order Selection with Search */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Package className="h-4 w-4 text-amber-500" />
                Select Order <span className="text-red-500">*</span>
              </Label>

              <div ref={dropdownRef} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by Order ID, Customer Name or Phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  className="h-10 rounded-lg border-gray-200 bg-gray-50/60 pl-9 pr-8 text-sm transition-colors placeholder:text-gray-400 focus:border-amber-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800/60 dark:placeholder:text-gray-600 dark:focus:border-amber-500 dark:focus:bg-gray-800"
                />
                {orderSearch ? (
                  <button
                    type="button"
                    onClick={() => setOrderSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : ordersLoading && dropdownOpen ? (
                  <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gray-400" />
                ) : null}

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 rounded-xl border border-gray-200/80 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-900">
                    <ScrollArea className="h-64">
                      <div className="p-2">
                        {!orderSearch.trim() && (
                          <p className="px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Recent orders — type to search by ID, name or phone
                          </p>
                        )}
                        {ordersLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div
                                key={index}
                                className="animate-pulse rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                  </div>

                                  <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                                  <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />

                                  <div className="flex gap-2 pt-2">
                                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : eligibleOrders.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs text-gray-400">
                            {orderSearch.trim()
                              ? "No matching orders found"
                              : "No eligible orders found"}
                          </p>
                        ) : (
                          eligibleOrders.map((order: any) => (
                            <button
                              key={order._id}
                              type="button"
                              onClick={() => {
                                setSelectedOrder(order._id);
                                setSelectedOrderObj(order);
                                setOrderSearch("");
                                setDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full rounded-lg px-3 py-2.5 text-left transition-colors mb-1",
                                selectedOrder === order._id
                                  ? "bg-amber-50 dark:bg-amber-900/20"
                                  : "hover:bg-gray-50/60 dark:hover:bg-gray-800/40",
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                    {order.customOrderId ||
                                      order._id.slice(0, 8)}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    ৳{order.total?.toFixed(2)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                  <User className="h-3 w-3" />
                                  {order.billingDetails?.fullName || "Unknown"}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {order.billingDetails?.phone || "N/A"}
                                </div>
                                {order.billingDetails?.address && (
                                  <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                    <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                    {order.billingDetails.address}
                                  </div>
                                )}

                                <div className="pt-1.5 flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {order.products?.length || 0} item
                                    {(order.products?.length || 0) !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {order.orderStatus}
                                  </Badge>
                                  {selectedOrder === order._id && (
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Selected Order Summary */}
              {selectedOrderDisplay && (
                <div className="rounded-lg border border-amber-200/50 bg-amber-50/30 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedOrderDisplay.customOrderId ||
                          selectedOrderDisplay._id.slice(0, 12)}
                      </span>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        ৳{selectedOrderDisplay.total?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <User className="h-3 w-3" />
                      {selectedOrderDisplay.billingDetails?.fullName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Phone className="h-3 w-3" />
                      {selectedOrderDisplay.billingDetails?.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Returned Products */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Returned Products <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddProduct}
                  disabled={!selectedOrder}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {returnedProducts.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder
                      ? "No products added yet"
                      : "Select an order first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {returnedProducts.map((product, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Product {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Product Selection */}
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                          <Input
                            placeholder="Search product by name / SKU..."
                            value={productSearchMap[index] || ""}
                            disabled={!selectedOrder}
                            onFocus={() => updateProductDropdown(index, true)}
                            onChange={(e) => {
                              updateProductSearch(index, e.target.value);
                              updateProductDropdown(index, true);
                            }}
                            className="pl-9"
                          />

                          {productDropdownOpen[index] && selectedOrder && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                              <ScrollArea className="h-64">
                                <div className="p-2">
                                  {getFilteredOrderProducts(index).length ===
                                  0 ? (
                                    <p className="py-6 text-center text-xs text-gray-400">
                                      No matching products found
                                    </p>
                                  ) : (
                                    getFilteredOrderProducts(index).map(
                                      (item: any) => {
                                        const info = getProductInfo(item);
                                        const selected =
                                          product.product === info.id;

                                        return (
                                          <button
                                            key={info.id}
                                            type="button"
                                            onClick={() => {
                                              handleProductChange(
                                                index,
                                                "product",
                                                info.id,
                                              );
                                              updateProductSearch(
                                                index,
                                                info.title,
                                              );
                                              updateProductDropdown(
                                                index,
                                                false,
                                              );
                                            }}
                                            className={cn(
                                              "mb-1 w-full rounded-lg p-3 text-left transition-all",
                                              selected
                                                ? "bg-amber-50 dark:bg-amber-900/20"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800",
                                            )}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-white">
                                                <Image
                                                  src={
                                                    info.images?.[0] ||
                                                    "/placeholder-product.png"
                                                  }
                                                  alt={info.title}
                                                  fill
                                                  className="object-cover"
                                                />
                                              </div>

                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                  {info.title}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                  <span>
                                                    Ordered: {item.quantity}
                                                  </span>
                                                  {info.sku && (
                                                    <span>SKU: {info.sku}</span>
                                                  )}
                                                </div>
                                              </div>

                                              {selected && (
                                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                  Selected
                                                </Badge>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      },
                                    )
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={product.quantity ?? ""}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const value = e.target.value;

                            handleProductChange(
                              index,
                              "quantity",
                              value === ""
                                ? undefined
                                : Math.max(1, parseInt(value, 10)),
                            );
                          }}
                          placeholder="Enter quantity"
                          className={cn(
                            "[appearance:textfield]",
                            "[&::-webkit-inner-spin-button]:appearance-none",
                            "[&::-webkit-outer-spin-button]:appearance-none",
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Return Reason */}
                        <Select
                          value={product.reason}
                          onValueChange={(value) =>
                            handleProductChange(index, "reason", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER_REFUSED">
                              Refused By Customer
                            </SelectItem>
                            <SelectItem value="DAMAGED">Damaged</SelectItem>
                            <SelectItem value="WRONG_PRODUCT">
                              Wrong Item
                            </SelectItem>
                            <SelectItem value="EXCHANGE">Exchange</SelectItem>
                            <SelectItem value="COURIER_RETURN">
                              Courier Return
                            </SelectItem>
                            <SelectItem value="ADDRESS_ISSUE">
                              Address Issue
                            </SelectItem>
                            <SelectItem value="DUPLICATE_ORDER">
                              Duplicate Order
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Damaged Checkbox */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`damaged-${index}`}
                            checked={product.isDamaged || false}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "isDamaged",
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded"
                          />
                          <label
                            htmlFor={`damaged-${index}`}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            Damaged
                          </label>
                        </div>
                      </div>

                      {/* Restock Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`restock-${index}`}
                          checked={product.shouldRestock !== false}
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              "shouldRestock",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded"
                        />
                        <label
                          htmlFor={`restock-${index}`}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          Restock to Inventory
                        </label>
                      </div>

                      {/* Product Notes */}
                      <Input
                        placeholder="Product notes (optional)"
                        value={product.notes || ""}
                        onChange={(e) =>
                          handleProductChange(index, "notes", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refund Information */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-blue-50/30 p-4 dark:border-gray-800 dark:bg-blue-900/10">
              <Label className="text-sm font-semibold">
                Refund Information
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="refundAmount" className="text-xs">
                    Refund Amount
                  </Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={refundAmount ?? ""}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const value = e.target.value;

                      setRefundAmount(
                        value === ""
                          ? undefined
                          : Math.max(0, parseFloat(value)),
                      );
                    }}
                    placeholder="0.00"
                    className={cn(
                      "[appearance:textfield]",
                      "[&::-webkit-inner-spin-button]:appearance-none",
                      "[&::-webkit-outer-spin-button]:appearance-none",
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="refundStatus" className="text-xs">
                    Refund Status
                  </Label>
                  <Select
                    value={refundStatus}
                    onValueChange={setRefundStatus}
                    disabled={!refundAmount || refundAmount <= 0}
                  >
                    <SelectTrigger id="refundStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSED">Processed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Return Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">
                Return Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this return..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </form>
        </ScrollArea>

        <div className="border-t border-gray-200 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => resetForm()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-amber-600 hover:cursor-pointer hover:bg-amber-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Creating..." : "Create Return"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
