
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast as showToast } from "sonner";
import {
  Search,
  X,
  Package,
  ImageIcon,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/redux/features/user/user.api";

interface SelectedProduct {
  productId: string;
  title: string;
  buyingPrice: number;
  quantity: number;
  totalAmount: number;
  image?: string;
  marketPrice?: number;
}

interface PurchaseProduct {
  product: string;
  quantity: number;
  buyingPrice: number;
  totalAmount: number;
}

type PaymentType = "FULL" | "ADVANCE" | "DUE";

interface PurchaseFormData {
  products: PurchaseProduct[];
  supplierName: string;
  supplierPhone: string;
  supplierAddress?: string;
  grandTotal: number;
  invoiceNo?: string;
  reference?: string;
  purchaseDate: string;
  purchaseStatus: string;
  paymentStatus: string;
  paymentType: "FULL" | "ADVANCE" | "DUE";
  paymentMethod?: string;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

interface SupplierOption {
  supplierName: string;
  supplierPhone: string;
  supplierAddress?: string;
}

interface ProductPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  suppliers?: SupplierOption[];
  products?: any[];
  onSubmit: (data: PurchaseFormData) => Promise<void>;
}

const inputCls =
  "h-9 rounded-lg border-gray-200 bg-gray-50/60 text-sm transition-colors placeholder:text-gray-400 focus:border-amber-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800/60 dark:placeholder:text-gray-600 dark:focus:border-amber-500 dark:focus:bg-gray-800";

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
      {icon}
      {children}
    </p>
  );
}

export const ProductPurchaseForm: React.FC<ProductPurchaseFormProps> = ({
  open,
  onOpenChange,
  suppliers = [],
  initialData,
  products = [],
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useGetMeQuery(undefined);
  const role = user?.data?.role;
  // Only ADMIN can view any price / amount related information on this form
  const isAdmin = role === "ADMIN";

  const [formData, setFormData] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierAddress: "",
    invoiceNo: "",
    reference: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchaseStatus: "PENDING",
    paymentStatus: "UNPAID",
    paymentType: "DUE" as PaymentType,
    paymentMethod: "",
    paidAmount: 0,
    dueAmount: 0,
    notes: "",
  });

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

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setFormData({
        supplierName: initialData.supplierName || "",
        supplierPhone: initialData.supplierPhone || "",
        supplierAddress: initialData.supplierAddress || "",
        invoiceNo: initialData.invoiceNo || "",
        reference: initialData.reference || "",
        purchaseDate: initialData.purchaseDate
          ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        purchaseStatus: initialData.purchaseStatus || "PENDING",
        paymentStatus: initialData.paymentStatus || "UNPAID",
        paymentType: initialData.paymentType || "DUE",
        paymentMethod: initialData.paymentMethod || "",
        paidAmount: initialData.paidAmount || 0,
        dueAmount: initialData.dueAmount || 0,
        notes: initialData.notes || "",
      });

      if (Array.isArray(initialData.products)) {
        setSelectedProducts(
          initialData.products.map((item: any) => {
            const qty = Number(item.quantity) || 1;
            // Fallback chain: saved buyingPrice -> product's buyingPrice -> product's market price -> 0
            const price =
              Number(item.buyingPrice) ||
              Number(item.product?.buyingPrice) ||
              Number(item.product?.price) ||
              0;
            return {
              productId: item.product?._id || item.product || "",
              title: item.product?.title || item.title || "",
              buyingPrice: price,
              quantity: qty,
              totalAmount: price * qty,
              image: item.product?.images?.[0],
              marketPrice: item.product?.price,
            };
          }),
        );
      }
    } else {
      setFormData({
        supplierName: "",
        supplierPhone: "",
        supplierAddress: "",
        invoiceNo: "",
        reference: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        purchaseStatus: "PENDING",
        paymentStatus: "UNPAID",
        paymentType: "DUE",
        paymentMethod: "",
        paidAmount: 0,
        dueAmount: 0,
        notes: "",
      });
      setSelectedProducts([]);
    }

    setErrors({});
    setProductSearch("");
  }, [initialData, open]);

  const addProduct = (product: any) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productId === product._id);
      if (existing) {
        return prev.map((p) =>
          p.productId === product._id
            ? {
              ...p,
              quantity: p.quantity + 1,
              totalAmount: p.buyingPrice * (p.quantity + 1),
            }
            : p,
        );
      }

      // Fallback chain so a required field is never silently left at 0
      // when the admin-only input isn't rendered for this role:
      // product's own buyingPrice -> product's market price -> 0
      const defaultPrice =
        Number(product.buyingPrice) || Number(product.price) || 0;

      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          buyingPrice: defaultPrice,
          quantity: 1,
          totalAmount: defaultPrice * 1,
          image: product.images?.[0],
          marketPrice: product.price,
        },
      ];
    });
    setProductSearch("");
    setDropdownOpen(false);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.products;
      return e;
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId),
    );
  };

  const handleSupplierSelect = (value: string) => {
    setSelectedSupplier(value);

    const supplier = suppliers.find(
      (item) => `${item.supplierName}-${item.supplierPhone}` === value,
    );

    if (!supplier) return;

    setFormData((prev) => ({
      ...prev,
      supplierName: supplier.supplierName,
      supplierPhone: supplier.supplierPhone,
      supplierAddress: supplier.supplierAddress || "",
    }));
  };

  const updateQty = (productId: string, value: number) => {
    const qty = Math.max(1, value);
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, quantity: qty, totalAmount: p.buyingPrice * qty }
          : p,
      ),
    );
  };

  const updateBuyingPrice = (productId: string, value: number) => {
    const price = Math.max(0, value);
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, buyingPrice: price, totalAmount: price * p.quantity }
          : p,
      ),
    );
  };

  const alreadySelected = (id: string) =>
    selectedProducts.some((p) => p.productId === id);

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p._id?.includes(productSearch),
  );

  const grandTotal = selectedProducts.reduce(
    (sum, p) => sum + p.totalAmount,
    0,
  );

  // Handle payment type change and auto-calculate amounts
  const handlePaymentTypeChange = (type: "FULL" | "ADVANCE" | "DUE") => {
    setFormData((prev) => {
      let paidAmount = 0;
      let dueAmount = grandTotal;

      if (type === "FULL") {
        paidAmount = grandTotal;
        dueAmount = 0;
      } else if (type === "ADVANCE") {
        paidAmount = prev.paidAmount || 0;
        dueAmount = Math.max(0, grandTotal - paidAmount);
      } else {
        // DUE
        paidAmount = 0;
        dueAmount = grandTotal;
      }

      return {
        ...prev,
        paymentType: type,
        paidAmount,
        dueAmount,
        paymentMethod: type === "DUE" ? "" : prev.paymentMethod,
      };
    });
  };

  // Handle paid amount change
  const handlePaidAmountChange = (amount: number) => {
    const paidAmount = Math.max(0, Math.min(amount, grandTotal));
    setFormData((prev) => ({
      ...prev,
      paidAmount,
      dueAmount: Math.max(0, grandTotal - paidAmount),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedProducts.length === 0) {
      newErrors.products = "Please add at least one product";
    } else {
      selectedProducts.forEach((p) => {
        // Buying price is an admin-only field on this form. A non-admin
        // (e.g. manager) never sees/edits this input, so we must not
        // require it from them — it's auto-filled from the product's
        // own data instead (see addProduct's defaultPrice fallback).
        if (isAdmin && p.buyingPrice <= 0)
          newErrors[`price_${p.productId}`] = "Price required";
        if (p.quantity <= 0)
          newErrors[`qty_${p.productId}`] = "Quantity required";
      });
    }

    if (!formData.supplierName.trim())
      newErrors.supplierName = "Supplier name is required";
    if (!formData.supplierPhone.trim())
      newErrors.supplierPhone = "Supplier phone is required";
    else if (!phoneRegex.test(formData.supplierPhone.trim()))
      newErrors.supplierPhone = "Valid phone number required";
    if (!formData.purchaseDate)
      newErrors.purchaseDate = "Purchase date is required";
    if (!formData.purchaseStatus)
      newErrors.purchaseStatus = "Purchase status is required";
    if (!formData.paymentStatus)
      newErrors.paymentStatus = "Payment status is required";

    // Payment validation (only relevant when the payment panel is visible, i.e. for admins)
    if (isAdmin) {
      if (!formData.paymentType)
        newErrors.paymentType = "Payment type is required";

      if (
        (formData.paymentType === "FULL" || formData.paymentType === "ADVANCE") &&
        !formData.paymentMethod
      ) {
        newErrors.paymentMethod = "Payment method is required";
      }

      if (formData.paymentType === "FULL" && formData.paidAmount !== grandTotal) {
        newErrors.paidAmount = "Full payment must equal grand total";
      }

      if (formData.paymentType === "ADVANCE" && formData.paidAmount <= 0) {
        newErrors.paidAmount = "Advance payment amount required";
      }

      if (formData.paymentType === "DUE" && formData.paidAmount > 0) {
        newErrors.paidAmount = "Due purchase cannot have paid amount";
      }

      if (formData.paidAmount > grandTotal) {
        newErrors.paidAmount = "Paid amount cannot exceed grand total";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) {
      showToast.error("Please fix the errors above");
      return;
    }

    try {
      setIsSubmitting(true);

      const purchaseProducts: PurchaseProduct[] = selectedProducts.map(
        (sp) => ({
          product: sp.productId,
          quantity: sp.quantity,
          buyingPrice: sp.buyingPrice,
          totalAmount: sp.buyingPrice * sp.quantity,
        }),
      );

      const submitData: PurchaseFormData = {
        ...formData,
        products: purchaseProducts,
        grandTotal,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to save purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl gap-0 p-0 overflow-hidden rounded-2xl border-gray-200/80 dark:border-gray-700/60 max-h-[95vh]">
        {/* Accent bar */}
        <div className="h-1 w-full bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500" />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">
              {initialData ? "Edit Purchase" : "Create New Purchase"}
            </DialogTitle>
          </div>
          {selectedProducts.length > 0 && (
            <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 dark:bg-amber-900/20">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {selectedProducts.length} item
                {selectedProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable Body ── */}
        <ScrollArea className="h-[60vh]">
          <div className="px-6 py-5">
            <form
              onSubmit={handleSubmit}
              id="purchase-form"
              className="space-y-6"
            >
              {/* ── Products Section ── */}
              <div>
                <SectionLabel
                  icon={
                    <Package className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  }
                >
                  Products ({selectedProducts.length})
                </SectionLabel>

                {errors.products && (
                  <p className="mb-2 text-xs text-red-500">{errors.products}</p>
                )}

                {/* Search input + dropdown */}
                <div ref={dropdownRef} className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search and add products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    className={cn(inputCls, "pl-9 pr-8")}
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-gray-200/80 bg-white shadow-lg dark:border-gray-700/60 dark:bg-gray-900">
                      <ScrollArea className="h-56">
                        <div className="p-2">
                          {filteredProducts.length === 0 ? (
                            <p className="px-3 py-3 text-xs text-gray-400">
                              No products found
                            </p>
                          ) : (
                            filteredProducts.map((product) => {
                              const inCart = alreadySelected(product._id);
                              const displayPrice = product?.buyingPrice;
                              return (
                                <button
                                  key={product._id}
                                  type="button"
                                  onClick={() => {
                                    if (!inCart) addProduct(product);
                                  }}
                                  disabled={inCart}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors mb-0.5",
                                    inCart
                                      ? "cursor-default opacity-50"
                                      : "hover:bg-amber-50/60 dark:hover:bg-amber-900/10",
                                  )}
                                >
                                  {/* Thumbnail */}
                                  {product.images?.[0] ? (
                                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                      <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                      <ImageIcon className="h-4 w-4 text-amber-400" />
                                    </div>
                                  )}

                                  {/* Info */}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {product.title}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {isAdmin && (
                                        <>৳{(displayPrice || 0).toFixed(2)}{" "}</>
                                      )}
                                      <span
                                        className={
                                          product.availableStock === 0
                                            ? "text-red-400"
                                            : "text-gray-400"
                                        }
                                      >
                                        {isAdmin && "· "}
                                        {product.availableStock === 0
                                          ? "Out of stock"
                                          : `${product.availableStock} available · ${product.totalAddedStock || 0} purchased`}
                                      </span>
                                    </p>
                                  </div>

                                  {/* Added badge or Plus icon */}
                                  {inCart ? (
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 rounded-full border-amber-200 bg-amber-50 text-[10px] text-amber-600 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                    >
                                      Added
                                    </Badge>
                                  ) : (
                                    <Plus className="h-4 w-4 shrink-0 text-amber-500" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Cart — empty state */}
                {selectedProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-amber-200 py-8 dark:border-amber-900/30">
                    <Package className="h-8 w-8 text-amber-300 dark:text-amber-800" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No products — search above to add
                    </p>
                  </div>
                ) : (
                  // Cart — product rows
                  <div className="space-y-2">
                    {selectedProducts.map((item) => (
                      <div
                        key={item.productId}
                        className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-3 dark:border-gray-800 dark:bg-gray-800/30"
                      >
                        {/* Row 1: image + title + delete */}
                        <div className="flex items-center gap-3 mb-3">
                          {item.image ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                              <Package className="h-4 w-4 text-amber-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {item.title}
                            </p>
                            {isAdmin && item.marketPrice !== undefined && (
                              <p className="text-xs text-gray-400">
                                Market price: ৳
                                {(item.marketPrice || 0).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(item.productId)}
                            className="ml-1 shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                            aria-label="Remove product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Row 2: buying price + qty controls + line total (price fields admin-only) */}
                        <div className="flex items-end gap-3 flex-wrap">
                          {/* Buying Price — ADMIN ONLY */}
                          {isAdmin && (
                            <div className="space-y-1 flex-1 min-w-27.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                Buying Price{" "}
                                <span className="text-red-400">*</span>
                              </Label>
                              <div className="relative">
                                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 select-none">
                                  ৳
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.buyingPrice || ""}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    updateBuyingPrice(
                                      item.productId,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={cn(
                                    inputCls,
                                    "pl-6",
                                    errors[`price_${item.productId}`] &&
                                    "border-red-500",
                                  )}
                                />
                              </div>
                              {errors[`price_${item.productId}`] && (
                                <p className="text-[10px] text-red-500">
                                  {errors[`price_${item.productId}`]}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Quantity stepper */}
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                              Quantity <span className="text-red-400">*</span>
                            </Label>
                            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.productId, item.quantity - 1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onWheel={(e) => e.currentTarget.blur()}
                                onChange={(e) =>
                                  updateQty(
                                    item.productId,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-10 bg-transparent text-center text-sm font-semibold text-gray-900 dark:text-gray-50 outline-none tabular-nums"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.productId, item.quantity + 1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {errors[`qty_${item.productId}`] && (
                              <p className="text-[10px] text-red-500">
                                {errors[`qty_${item.productId}`]}
                              </p>
                            )}
                          </div>

                          {/* Line total — ADMIN ONLY */}
                          {isAdmin && (
                            <div className="space-y-1 text-right min-w-22.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                Total
                              </Label>
                              <p className="h-9 flex items-center justify-end text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                                ৳{item.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* ── Supplier Info ── */}
              {!initialData && suppliers.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Select Existing Supplier
                  </Label>

                  <Select
                    value={selectedSupplier}
                    onValueChange={handleSupplierSelect}
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Choose saved supplier" />
                    </SelectTrigger>

                    <SelectContent>
                      {suppliers.map((supplier) => {
                        const value = `${supplier.supplierName}-${supplier.supplierPhone}`;

                        return (
                          <SelectItem key={value} value={value}>
                            {supplier.supplierName} ({supplier.supplierPhone})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <SectionLabel icon={<span className="text-[11px]">👤</span>}>
                  Supplier Information
                </SectionLabel>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="supplierName"
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                      >
                        Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="supplierName"
                        placeholder="Supplier name"
                        value={formData.supplierName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplierName: e.target.value,
                          })
                        }
                        className={cn(
                          inputCls,
                          errors.supplierName && "border-red-500",
                        )}
                      />
                      {errors.supplierName && (
                        <p className="text-[10px] text-red-500">
                          {errors.supplierName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="supplierPhone"
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                      >
                        Phone <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="supplierPhone"
                        placeholder="01XXXXXXXXX"
                        value={formData.supplierPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplierPhone: e.target.value,
                          })
                        }
                        className={cn(
                          inputCls,
                          errors.supplierPhone && "border-red-500",
                        )}
                      />
                      {errors.supplierPhone && (
                        <p className="text-[10px] text-red-500">
                          {errors.supplierPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="supplierAddress"
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                    >
                      Address (Optional)
                    </Label>
                    <Input
                      id="supplierAddress"
                      placeholder="Supplier address"
                      value={formData.supplierAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplierAddress: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* ── Order Details ── */}
              <div>
                <SectionLabel icon={<span className="text-[11px]">📦</span>}>
                  Order Details
                </SectionLabel>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="invoiceNo"
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                    >
                      Invoice Number (Optional)
                    </Label>
                    <Input
                      id="invoiceNo"
                      placeholder="INV-001"
                      value={formData.invoiceNo}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNo: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="reference"
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                    >
                      Reference (Optional)
                    </Label>
                    <Input
                      id="reference"
                      placeholder="Reference number"
                      value={formData.reference}
                      onChange={(e) =>
                        setFormData({ ...formData, reference: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="purchaseDate"
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                    >
                      Purchase Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
                      }
                      className={cn(
                        inputCls,
                        errors.purchaseDate && "border-red-500",
                      )}
                    />
                    {errors.purchaseDate && (
                      <p className="text-[10px] text-red-500">
                        {errors.purchaseDate}
                      </p>
                    )}
                  </div>
                  {/* Grand Total display — ADMIN ONLY */}
                  {isAdmin && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Grand Total
                      </Label>
                      <div className="flex items-center h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-amber-50/60 dark:bg-amber-900/10 font-bold tabular-nums text-amber-700 dark:text-amber-400 text-sm">
                        ৳
                        {grandTotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* ── Status ── */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="purchaseStatus"
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                  >
                    Purchase Status <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.purchaseStatus}
                    onValueChange={(v) =>
                      setFormData({ ...formData, purchaseStatus: v })
                    }
                  >
                    <SelectTrigger
                      id="purchaseStatus"
                      className={cn(
                        inputCls,
                        "w-full",
                        errors.purchaseStatus && "border-red-500",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ORDERED">Ordered</SelectItem>
                      <SelectItem value="RECEIVED">Received</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.purchaseStatus && (
                    <p className="text-[10px] text-red-500">
                      {errors.purchaseStatus}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="paymentStatus"
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                  >
                    Payment Status <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(v) =>
                      setFormData({ ...formData, paymentStatus: v })
                    }
                  >
                    <SelectTrigger
                      id="paymentStatus"
                      className={cn(
                        inputCls,
                        "w-full",
                        errors.paymentStatus && "border-red-500",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentStatus && (
                    <p className="text-[10px] text-red-500">
                      {errors.paymentStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Payment Information — ADMIN ONLY (all amounts/prices live here) ── */}
              {isAdmin && (
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                  <SectionLabel
                    icon={
                      <Package className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    }
                  >
                    Payment Information
                  </SectionLabel>

                  {/* Payment Type Selection */}
                  <div className="mb-4 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Payment Type <span className="text-red-400">*</span>
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(["FULL", "ADVANCE", "DUE"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handlePaymentTypeChange(type)}
                          className={cn(
                            "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all",
                            formData.paymentType === type
                              ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-300"
                              : "border-gray-200 bg-white text-gray-600 hover:border-amber-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-amber-800",
                          )}
                        >
                          {type === "FULL" && "Full Payment"}
                          {type === "ADVANCE" && "Advance Payment"}
                          {type === "DUE" && "Due (No Payment)"}
                        </button>
                      ))}
                    </div>
                    {errors.paymentType && (
                      <p className="text-[10px] text-red-500">
                        {errors.paymentType}
                      </p>
                    )}
                  </div>

                  {/* Payment Method - Only for FULL/ADVANCE */}
                  {(formData.paymentType === "FULL" ||
                    formData.paymentType === "ADVANCE") && (
                      <div className="mb-4">
                        <Label
                          htmlFor="paymentMethod"
                          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block"
                        >
                          Payment Method <span className="text-red-400">*</span>
                        </Label>
                        <Select
                          value={formData.paymentMethod || ""}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="paymentMethod"
                            className={cn(
                              inputCls,
                              errors.paymentMethod && "border-red-500",
                            )}
                          >
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="CHEQUE">Cheque</SelectItem>
                            <SelectItem value="CARD">Card</SelectItem>
                            <SelectItem value="MOBILE_BANKING">
                              Mobile Banking
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.paymentMethod && (
                          <p className="mt-1 text-[10px] text-red-500">
                            {errors.paymentMethod}
                          </p>
                        )}
                      </div>
                    )}

                  {/* Amount Fields */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Grand Total
                      </Label>
                      <div className="flex items-center h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold tabular-nums text-amber-700 dark:text-amber-400 text-sm">
                        ৳{grandTotal.toFixed(2)}
                      </div>
                    </div>

                    {formData.paymentType !== "DUE" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="paidAmount"
                          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                        >
                          Paid Amount{" "}
                          {formData.paymentType === "FULL" && "(Auto)"}
                        </Label>
                        <Input
                          id="paidAmount"
                          type="number"
                          min="0"
                          max={grandTotal}
                          step="0.01"
                          value={formData.paidAmount}
                          onChange={(e) =>
                            handlePaidAmountChange(Number(e.target.value))
                          }
                          disabled={formData.paymentType === "FULL"}
                          className={cn(
                            inputCls,
                            errors.paidAmount && "border-red-500",
                            formData.paymentType === "FULL" &&
                            "opacity-50 cursor-not-allowed",
                          )}
                          placeholder="Enter paid amount"
                        />
                        {errors.paidAmount && (
                          <p className="text-[10px] text-red-500">
                            {errors.paidAmount}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Due Amount {formData.paymentType !== "DUE" && "(Auto)"}
                      </Label>
                      <div className="flex items-center h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold tabular-nums text-sm">
                        <span
                          className={cn(
                            formData.dueAmount > 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400",
                          )}
                        >
                          ৳{formData.dueAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notes ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="notes"
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                >
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this purchase…"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="resize-none min-h-20 rounded-lg border-gray-200 bg-gray-50/60 text-sm dark:border-gray-700 dark:bg-gray-800/60"
                />
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-600">
                <span className="text-red-400">*</span> Required fields
              </p>
            </form>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
          {/* Grand total summary strip — ADMIN ONLY */}
          {isAdmin && selectedProducts.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-2 mb-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <span className="text-xs font-semibold text-amber-700/70 dark:text-amber-500/70">
                {selectedProducts.reduce((s, p) => s + p.quantity, 0)} units ·{" "}
                {selectedProducts.length} product
                {selectedProducts.length !== 1 ? "s" : ""}
              </span>
              <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
                ৳
                {grandTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <button
              type="submit"
              form="purchase-form"
              disabled={isSubmitting || selectedProducts.length === 0}
              className={cn(
                "group relative overflow-hidden inline-flex items-center gap-1.5",
                "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600",
                "transition-all duration-200 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-[200%]"
              />
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {initialData ? "Updating…" : "Creating…"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  {initialData ? "Update Purchase" : "Create Purchase"}
                </span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};