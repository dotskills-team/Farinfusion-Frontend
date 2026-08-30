

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { IPurchase } from "@/types/purchase";
import { useGetMeQuery } from "@/redux/features/user/user.api";

interface ProductPurchaseDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: IPurchase;
}

const formatPaymentMethod = (method?: string) => {
  if (!method) return "N/A";

  return method
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getPaymentTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    FULL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
    ADVANCE:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
    DUE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  };

  return colors[type] || colors.DUE;
};

const getPurchaseStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING:
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
    ORDERED: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200",
    SHIPPED:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200",
    RECEIVED:
      "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    COMPLETED:
      "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200",
    CANCELLED: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
  };
  return colors[status] || colors.PENDING;
};

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PAID: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    PARTIAL:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200",
    UNPAID: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
  };
  return colors[status] || colors.UNPAID;
};

const ProductPurchaseDetailsModal: React.FC<
  ProductPurchaseDetailsModalProps
> = ({ open, onOpenChange, purchase }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const { data: user } = useGetMeQuery(undefined);
  const role = user?.data?.role;
  // Only ADMIN can view any price / amount related information on this modal
  const isAdmin = role === "ADMIN";

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // const totalProfit =
  //   purchase.products?.reduce((acc, item: any) => {
  //     const sellingPrice = item.product?.price || 0;

  //     const buyingPrice = item.buyingPrice || 0;

  //     const profitPerUnit = sellingPrice - buyingPrice;

  //     return acc + profitPerUnit * item.quantity;
  //   }, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-auto flex flex-col">
        <DialogHeader className="px-4 pt-2">
          <DialogTitle className="text-xl font-bold">
            Purchase Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="space-y-6 h-[70vh] px-4">
          {/* Header Info */}
          <Card className="mb-4 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-amber-900/70 dark:text-amber-200/70 font-semibold">
                    PURCHASE ID
                  </p>
                  <p className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {purchase._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-900/70 dark:text-amber-200/70 font-semibold">
                    PURCHASE DATE
                  </p>
                  <p className="font-medium text-amber-900 dark:text-amber-100 mt-1">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card className="mb-4 ">
            <CardHeader>
              <CardTitle className="text-base">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {purchase.products?.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.product?.title}</p>

                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Buying price / line total — ADMIN ONLY */}
                    {isAdmin && (
                      <div className="text-right">
                        <p>৳{item.buyingPrice}</p>

                        <p className="font-bold">৳{item.totalAmount}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Audit Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Audit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    CREATED BY
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {purchase.createdBy?.name || "N/A"}
                  </p>
                </div>

                {purchase.updatedBy && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      UPDATED BY
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {purchase.updatedBy?.name || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary — ADMIN ONLY */}
          {isAdmin && (
            <Card className="mb-4 border-emerald-200 dark:border-emerald-900/40">
              <CardHeader>
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Grand Total
                    </p>
                    <p className="mt-2 text-lg font-bold text-blue-600">
                      ৳{(purchase.grandTotal || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Paid Amount
                    </p>
                    <p className="mt-2 text-lg font-bold text-emerald-600">
                      ৳{(purchase.paidAmount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Due Amount
                    </p>
                    <p
                      className={`mt-2 text-lg font-bold ${purchase.dueAmount > 0
                          ? "text-red-500"
                          : "text-emerald-600"
                        }`}
                    >
                      ৳{(purchase.dueAmount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Payment Method
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {formatPaymentMethod(purchase.paymentMethod)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Badge
                    className={getPaymentStatusColor(purchase.paymentStatus)}
                  >
                    {purchase.paymentStatus}
                  </Badge>

                  <Badge className={getPaymentTypeColor(purchase.paymentType)}>
                    {purchase.paymentType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier Info */}
          <Card className="mb-4 ">
            <CardHeader>
              <CardTitle className="text-base">Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  SUPPLIER NAME
                </p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                  {purchase.supplierName}
                </p>
              </div>

              {purchase.supplierPhone && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    PHONE
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {purchase.supplierPhone}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(purchase.supplierPhone || "", "phone")
                      }
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copiedField === "phone" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {purchase.supplierAddress && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    ADDRESS
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {purchase.supplierAddress}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card className="mb-4 ">
            <CardHeader>
              <CardTitle className="text-base">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                    PURCHASE STATUS
                  </p>
                  <Badge
                    className={getPurchaseStatusColor(purchase.purchaseStatus)}
                  >
                    {purchase.purchaseStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                    PAYMENT STATUS
                  </p>
                  <Badge
                    className={getPaymentStatusColor(purchase.paymentStatus)}
                  >
                    {purchase.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice & Reference */}
          {(purchase.invoiceNo || purchase.reference) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Reference Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {purchase.invoiceNo && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      INVOICE NO
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {purchase.invoiceNo}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(purchase.invoiceNo || "", "invoice")
                        }
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {copiedField === "invoice" ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {purchase.reference && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      REFERENCE
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {purchase.reference}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(purchase.reference || "", "reference")
                        }
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {copiedField === "reference" ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {purchase.notes && (
            <Card className="my-4">
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {purchase.notes}
                </p>
              </CardContent>
            </Card>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPurchaseDetailsModal;