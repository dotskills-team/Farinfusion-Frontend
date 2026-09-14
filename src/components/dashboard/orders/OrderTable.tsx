/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderRowActions } from "./OrderRowActions";
import type { Order } from "@/types/orders";
import { AlertCircle, Clock, TrendingUp, Truck } from "lucide-react";
import { useGetAllCouriersQuery } from "@/lib/hooks";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onConfirmOrder?: (order: Order) => void;
  onViewOrder?: (order: Order) => void;
  onAssignCourier?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
  onRestoreOrder?: (order: Order) => void;
  setDeleteTarget?: (order: Order) => void;
  setDeleteOpen?: (open: boolean) => void;
  onPartialUpdate?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
  onManualDeliveryUpdate?: (order: Order) => void;
  onExchange?: (order: Order) => void;
  onMarkDamage?: (order: Order) => void;
  refetch: () => void;
  onCompleteOrder?: (order: Order) => void;
}

export function OrderTable({
  orders,
  loading,
  error,
  onConfirmOrder,
  onViewInvoice,
  onCancelOrder,
  onRestoreOrder,
  onAssignCourier,
  onViewOrder,
  onPartialUpdate,
  onManualDeliveryUpdate,
  onExchange,
  onMarkDamage,
  setDeleteTarget,
  setDeleteOpen,
  onCompleteOrder,
  refetch,
}: OrderTableProps) {
  const { data: courierRes } = useGetAllCouriersQuery([], {
    pollingInterval: 10000,
  });
  // console.log("courierRes", courierRes);
  const courierMap = new Map<string, any>();

  courierRes?.data?.forEach((c: any) => {
    courierMap.set(c.order?.toString(), c);
  });

  console.log("courierMap", courierMap);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              Failed to load orders
            </p>
            <p className="mt-1 text-xs text-destructive/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <TrendingUp className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          No orders found
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50/60 hover:bg-amber-50/60 dark:bg-amber-900/10 dark:hover:bg-amber-900/10 border-b border-amber-100/80 dark:border-amber-900/20">
            {[
              "Order ID",
              "Assigned By",
              "Payment",
              "Customer",
              "Total",
              "Order Status",
              "Delivery Status",
              "Courier",
              "Order Date",
              "Actions",
            ].map((h) => (
              <TableHead
                key={h}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest text-amber-700/70 dark:text-amber-500/70",
                  h === "Total" && "text-right",
                  h === "Actions" && "text-center",
                )}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const courier = courierMap.get(order._id?.toString());
            // console.log(courier);

            return (
              <TableRow key={order._id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs font-medium">
                  {order?.customOrderId || order._id?.slice(0, 10)}
                </TableCell>
                <TableCell>
                  {order?.seller ? (
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">{order?.seller?.name}</span>
                      <span className="text-muted-foreground">
                        {order?.seller?.role}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium">
                    {order?.transactionId && (
                      <span className="text-green-600">COD</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {order.billingDetails?.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.billingDetails?.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ৳{order.total}
                </TableCell>

                <TableCell>
                  <OrderStatusBadge status={order.orderStatus} type="order" />
                </TableCell>
                <TableCell>
                  {order?.deliveryStatus ? (
                    <div className="space-y-1">
                      <OrderStatusBadge
                        status={order?.deliveryStatus}
                        type="delivery"
                      />
                      {courier?.estimatedDelivery && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Est:{" "}
                          {new Date(
                            courier?.estimatedDelivery,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {courier?._id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2 items-center flex-col">
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg">
                          <Truck
                            size={14}
                            className="text-blue-600 dark:text-blue-400"
                          />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {courier.courierName}
                          </span>
                        </div>
                        {courier.trackingCode && (
                          <span className="text-[8px] text-gray-500 dark:text-gray-400 font-mono">
                            T.Code:{courier.trackingCode}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : order.orderStatus === "CONFIRMED" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1.5 rounded-lg font-medium">
                      <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-pulse" />
                      Not assigned...
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                        : "—"}
                    </span>
                    {order.scheduledAt && (
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-[10px] font-medium text-blue-700 dark:text-blue-300 w-fit">
                        <Clock className="h-3 w-3" />
                        {format(new Date(order.scheduledAt), "MMM d, p")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <OrderRowActions
                    order={order}
                    refetch={refetch}
                    courier={courier}
                    onConfirm={onConfirmOrder}
                    onView={onViewOrder}
                    onAssignCourier={onAssignCourier}
                    onPartialUpdate={onPartialUpdate}
                    onMarkExchange={onExchange}
                    onMarkDamage={onMarkDamage}
                    onCancelOrder={onCancelOrder}
                    onRestoreOrder={onRestoreOrder}
                    setDeleteTarget={setDeleteTarget}
                    onViewInvoice={onViewInvoice}
                    setDeleteOpen={setDeleteOpen}
                    onComplete={onCompleteOrder}
                    onManualDeliveryUpdate={onManualDeliveryUpdate}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
