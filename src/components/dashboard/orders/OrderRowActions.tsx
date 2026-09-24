/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Truck,
  CheckCircle2,
  UserCog,
  User,
  PencilLine,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Plus,
  FileText,
  TimerReset,
  X,
  PhoneMissed,
} from "lucide-react";
import type { Order } from "@/types/orders";
import { Courier } from "@/types/courier";
import { cn } from "@/lib/utils";
import {
  useGetAllUsersQuery,
  useGetMeQuery,
} from "@/redux/features/user/user.api";
import { toast } from "sonner";
import { EditOrderModal } from "./EditOrderModal";
import {
  useMarkNoResponseMutation,
  useRestoreNoResponseMutation,
  useUpdateSellerMutation,
} from "@/redux/features/orders/ordersApi";
import { OrderModeChangeModal } from "@/components/shared/OrderModeChangeModal";
import { CancelOrderModal } from "./CancelOrderModal";

interface OrderRowActionsProps {
  order: Order;
  courier?: Courier | null;
  refetch: () => void;
  onConfirm?: (order: Order) => void;
  onView?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
  onAssignCourier?: (order: Order) => void;
  setDeleteTarget?: (order: Order) => void;
  setDeleteOpen?: (open: boolean) => void;
  onComplete?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
  onRestoreOrder?: (order: Order) => void;
  onMarkDamage?: (order: Order) => void;
  onMarkExchange?: (order: Order) => void;
  onPartialUpdate?: (order: Order) => void;
  onManualDeliveryUpdate?: (order: Order) => void;
}

export function OrderRowActions({
  order,
  courier,
  onManualDeliveryUpdate,
  refetch,
  onConfirm,
  onPartialUpdate,
  onView,
  onCancelOrder,
  onRestoreOrder,
  onViewInvoice,
  onAssignCourier,
  setDeleteOpen,
  setDeleteTarget,
  onMarkDamage,
  onMarkExchange,
  onComplete,
}: OrderRowActionsProps) {
  const isPending = order.orderStatus === "PENDING";
  const isConfirmed = order.orderStatus === "CONFIRMED";
  const isCompleted = order.orderStatus === "COMPLETED";
  const isCanceled = order.orderStatus === "CANCELLED";
  const isPartial = order.orderStatus === "PARTIAL";
  const isDelivered = courier?.deliveryStatus === "DELIVERED";
  const canComplete = isConfirmed && isDelivered && !isCompleted;
  const { data } = useGetMeQuery(undefined);
  const userRole = data?.data?.role;
  const [markNoResponse] = useMarkNoResponseMutation();

  const isAdmin = userRole === "ADMIN";
  const hasCourier = !!courier;

  // const canEdit =
  //   userRole &&
  //   ["ADMIN", "MODERATOR", "MANAGER", "TELESALES"].includes(userRole) && !order.courierName;

  // const isRoleAllowed =
  //     ["ADMIN", "MANAGER", "TELESALES"].includes(userRole) ||
  //     (userRole === "MODERATOR" && !isConfirmed);
  //
  // const canEdit =
  //     userRole &&
  //     isRoleAllowed &&
  //     !order?.courierName &&
  //     !isCompleted &&
  //     !isDelivered;

  const hasAccess =
    userRole && ["ADMIN", "MANAGER", "TELESALES"].includes(userRole);
  const isNoResponse = order.orderStatus === "NO_RESPONSE";
  const isWaitingStock = order.orderStatus === "WAITING_FOR_STOCK";

  const [editOpen, setEditOpen] = useState(false);
  const [editOpenTiming, setEditOpenTiming] = useState(false);
  const [restoreCanceledConfirmOpen, setRestoreCanceledConfirmOpen] =
    useState(false);

  const withoutTELESALES = userRole && ["ADMIN", "MANAGER"].includes(userRole);

  const canEditAfterConfirm = isAdmin || withoutTELESALES; // ADMIN/MANAGER

  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [manualDeliveryModalOpen, setManualDeliveryModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    (order.seller as any)?._id ?? order.seller ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const limit = 150;
  const { data: users } = useGetAllUsersQuery({ limit });
  const [restoreNoResponse, { isLoading: isRestoring }] =
    useRestoreNoResponseMutation();
  const [updateSeller] = useUpdateSellerMutation();

  const sellerOptions = users?.data ?? [];

  const currentSellerName =
    (order.seller as any)?.name ??
    sellerOptions.find((u) => u._id === order.seller)?.name ??
    null;

  const handleSaveSeller = async () => {
    if (!selectedSellerId) return;
    setIsSaving(true);
    try {
      await updateSeller({
        _id: order._id,
        data: { seller: selectedSellerId },
      }).unwrap();
      toast.success("Seller assigned successfully");
      refetch();
      setSellerDialogOpen(false);
    } catch {
      toast.error("Failed to assign seller");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreOrder = async () => {
    try {
      await restoreNoResponse({
        _id: order._id,
      }).unwrap();

      toast.success("Order restored successfully", {
        description: `Order ${order.customOrderId} has been restored to PENDING status.`,
      });

      setRestoreConfirmOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to restore order");
    }
  };

  const handleNoResponse = async () => {
    try {
      await markNoResponse({
        _id: order._id,
        orderStatus: "NO_RESPONSE",
      }).unwrap();

      toast.success("Order marked as No Response");

      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Order actions</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 rounded-xl">
          {/* View */}
          {onView && (
            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer"
              onClick={() => onView(order)}
            >
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              View Details
            </DropdownMenuItem>
          )}

          {/* View Invoice - Show when courier is assigned and delivery hasn't started */}
          {hasCourier &&
            courier?.deliveryStatus !== "DELIVERED" &&
            courier?.deliveryStatus !== "FAILED" &&
            onViewInvoice && (
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-amber-600 focus:text-amber-600 dark:text-amber-400"
                onClick={() => onViewInvoice(order)}
              >
                <FileText className="h-3.5 w-3.5" />
                View Invoice
              </DropdownMenuItem>
            )}

          {order.orderStatus === "PENDING" && (
            <DropdownMenuItem
              onClick={handleNoResponse}
              className="text-rose-600"
            >
              <PhoneMissed className="mr-2 h-4 w-4" />
              No Response
            </DropdownMenuItem>
          )}

          {/* Restore Order - Only for NO_RESPONSE status */}
          {order.orderStatus === "NO_RESPONSE" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRestoreConfirmOpen(true)}
                className="gap-2 text-sm cursor-pointer text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                disabled={isRestoring}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isRestoring ? "Restoring..." : "Restore Order"}
              </DropdownMenuItem>
            </>
          )}

          {!isNoResponse &&
            order.isPublished &&
            hasAccess &&
            isConfirmed &&
            !hasCourier &&
            onManualDeliveryUpdate && (
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                onClick={() => setManualDeliveryModalOpen(true)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Delivered
              </DropdownMenuItem>
            )}

          {/* order mode option */}
          {!isNoResponse &&
            !isWaitingStock &&
            !(isDelivered || isConfirmed) && (
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-amber-600 focus:text-amber-600 dark:text-amber-400"
                onClick={() => setEditOpenTiming(true)}
                disabled={hasCourier && !isAdmin}
              >
                <TimerReset className="h-3.5 w-3.5" />
                Order Timing
              </DropdownMenuItem>
            )}

          {/* Edit */}
          {/* {!isWaitingStock && (
            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer text-blue-600 focus:text-blue-600 dark:text-blue-400"
              onClick={() => setEditOpen(true)}
              disabled={hasCourier && !isAdmin}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit Order
            </DropdownMenuItem>
          )} */}

          {!isWaitingStock && (
            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer text-blue-600 focus:text-blue-600 dark:text-blue-400"
              onClick={() => setEditOpen(true)}
              disabled={(hasCourier && !isAdmin) || (isConfirmed && !canEditAfterConfirm)}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit Order
            </DropdownMenuItem>
          )}

          {/* Assign Seller */}
          {!isNoResponse &&
            !isWaitingStock &&
            order.isPublished &&
            withoutTELESALES && (
              <>
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer"
                  onClick={() => setSellerDialogOpen(true)}
                >
                  <UserCog className="h-3.5 w-3.5 text-gray-500" />
                  <span className="flex-1">Assign Seller</span>
                  {currentSellerName && (
                    <span className="truncate max-w-20 text-[10px] text-gray-400 dark:text-gray-500">
                      {currentSellerName}
                    </span>
                  )}
                </DropdownMenuItem>
              </>
            )}

          {/* {hasAccess && !isCompleted && onCancelOrder && (
            <DropdownMenuItem
              onClick={() => setCancelModalOpen(true)}
              className="gap-2 text-sm cursor-pointer text-rose-600 focus:text-rose-600 dark:text-rose-400"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Order
            </DropdownMenuItem>
          )} */}

          {hasAccess && !isCompleted && !isCanceled && onCancelOrder && (
            <DropdownMenuItem
              onClick={() => setCancelModalOpen(true)}
              className="gap-2 text-sm cursor-pointer text-rose-600 focus:text-rose-600 dark:text-rose-400"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Order
            </DropdownMenuItem>
          )}

          {hasAccess && isCanceled && onRestoreOrder && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRestoreCanceledConfirmOpen(true)}
                className="gap-2 text-sm cursor-pointer text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore Order
              </DropdownMenuItem>
            </>
          )}

          {/* Partial Update - Only for ADMIN and when order is CONFIRMED */}
          {!isNoResponse && isAdmin && isConfirmed && onPartialUpdate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-blue-600 focus:text-blue-600 dark:text-blue-400"
                onClick={() => onPartialUpdate(order)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Partial Update</span>
              </DropdownMenuItem>
            </>
          )}

          {/* Confirm */}
          {!isNoResponse &&
            order.isPublished &&
            hasAccess &&
            isPending &&
            onConfirm && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                  onClick={() => onConfirm(order)}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirm Order
                </DropdownMenuItem>
              </>
            )}

          {!isNoResponse &&
            order.isPublished &&
            hasAccess &&
            isConfirmed &&
            !hasCourier &&
            onAssignCourier && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer text-blue-600 focus:text-blue-600 dark:text-blue-400"
                  onClick={() => onAssignCourier(order)}
                >
                  <Truck className="h-3.5 w-3.5" />
                  Assign Courier
                </DropdownMenuItem>
              </>
            )}

          {/* Reassign Courier - For ADMIN only when courier is already assigned */}
          {!isNoResponse &&
            isAdmin &&
            isConfirmed &&
            hasCourier &&
            onAssignCourier && (
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-purple-600 focus:text-purple-600 dark:text-purple-400"
                onClick={() => onAssignCourier(order)}
              >
                <Truck className="h-3.5 w-3.5" />
                Reassign Courier
              </DropdownMenuItem>
            )}

          <DropdownMenuItem
            disabled={userRole !== "ADMIN"}
            className="gap-2 text-sm cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
            onClick={() => {
              if (!setDeleteTarget || !setDeleteOpen) return;
              setDeleteTarget(order);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>

          {/* Mark as Completed */}
          {!isNoResponse &&
            order.isPublished &&
            hasAccess &&
            canComplete &&
            onComplete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={cn(
                    "gap-2 text-sm font-semibold cursor-pointer",
                    "text-violet-600 focus:text-violet-600 dark:text-violet-400",
                  )}
                  onClick={() => onComplete(order)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark as Completed
                </DropdownMenuItem>
              </>
            )}

          {/* Already completed */}
          {isCompleted && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled
                className="gap-2 text-sm text-gray-400 cursor-default"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Order Completed
              </DropdownMenuItem>
            </>
          )}

          {/* Mark as Damage */}
          {!isNoResponse && order.isPublished && hasAccess && onMarkDamage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => onMarkDamage(order)}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Mark as Damage
              </DropdownMenuItem>
            </>
          )}

          {/* Mark as Exchange */}
          {!isNoResponse &&
            order.isPublished &&
            hasAccess &&
            isCompleted &&
            onMarkExchange && (
              <DropdownMenuItem
                className="gap-2 text-sm cursor-pointer text-amber-600 focus:text-amber-600 dark:text-amber-400"
                onClick={() => onMarkExchange(order)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Mark as Exchange
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Edit Order Modal ── */}
      <EditOrderModal
        open={editOpen}
        order={order}
        onOpenChange={setEditOpen}
        onSuccess={refetch}
      />

      {/* ---- edit order timing ---- */}
      <OrderModeChangeModal
        open={editOpenTiming}
        order={order}
        onOpenChange={setEditOpenTiming}
        onSuccess={refetch}
      />

      <CancelOrderModal
        open={cancelModalOpen}
        order={order}
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={() => {
          setCancelModalOpen(false);
          onCancelOrder?.(order);
        }}
      />

      <Dialog
        open={manualDeliveryModalOpen}
        onOpenChange={setManualDeliveryModalOpen}
      >
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden rounded-2xl border-gray-200/80 dark:border-gray-700/60">
          {/* Top gradient */}
          <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Confirm Manual Delivery
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Update this order as successfully delivered
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {order.customOrderId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">
                    {order.billingDetails?.fullName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span>{order.billingDetails?.phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-emerald-600">
                    ৳{order.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/10">
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                This will automatically:
                <br />• Set delivery status → <strong>DELIVERED</strong>
                <br />• Set order status → <strong>COMPLETED</strong>
                <br />• Trigger salary/report calculations
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t mb-1 border-gray-100 px-6 py-3 dark:border-gray-800">
            <Button
              variant="outline"
              className="rounded-xl hover:cursor-pointer"
              onClick={() => setManualDeliveryModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl hover:cursor-pointer bg-emerald-600 hover:bg-emerald-700"
              onClick={async () => {
                await onManualDeliveryUpdate?.(order);
                setManualDeliveryModalOpen(false);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden rounded-2xl border-gray-200/80 dark:border-gray-700/60">
          {/* Top gradient */}
          <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Restore Order
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Restore this order back to PENDING status
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {order.customOrderId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">
                    {order.billingDetails?.fullName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Current Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                    NO_RESPONSE
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
                  <span className="text-gray-500">New Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    PENDING
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/40 dark:bg-blue-900/10">
              <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                <strong>What happens next:</strong>
                <br />• Order status will be restored to{" "}
                <strong>PENDING</strong>
                <br />• Stock quantities will be adjusted back to inventory
                <br />• Order will appear in main orders list
                <br />• You can continue processing this order normally
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t my-1 border-gray-100 px-6 py-3 dark:border-gray-800">
            <Button
              variant="outline"
              className="rounded-xl hover:cursor-pointer"
              onClick={() => setRestoreConfirmOpen(false)}
              disabled={isRestoring}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl hover:cursor-pointer bg-emerald-600 hover:bg-emerald-700"
              onClick={handleRestoreOrder}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={restoreCanceledConfirmOpen}
        onOpenChange={setRestoreCanceledConfirmOpen}
      >
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden rounded-2xl border-gray-200/80 dark:border-gray-700/60">
          <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />

          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Restore Cancelled Order
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Bring this cancelled order back to active status
              </DialogDescription>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {order.customOrderId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">
                    {order.billingDetails?.fullName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Current Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                    CANCELLED
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
                  <span className="text-gray-500">New Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    CONFIRMED
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/40 dark:bg-blue-900/10">
              <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                <strong>What happens next:</strong>
                <br />• Order status will change to <strong>CONFIRMED</strong>
                <br />• Stock will be deducted again from inventory
                <br />• Order will appear back in the active orders list
              </p>
            </div>
          </div>

          <DialogFooter className="border-t my-1 border-gray-100 px-6 py-3 dark:border-gray-800">
            <Button
              variant="outline"
              className="rounded-xl hover:cursor-pointer"
              onClick={() => setRestoreCanceledConfirmOpen(false)}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl hover:cursor-pointer bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                onRestoreOrder?.(order);
                setRestoreCanceledConfirmOpen(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── Assign Seller Dialog ── */}
      <Dialog open={sellerDialogOpen} onOpenChange={setSellerDialogOpen}>
        <DialogContent className="sm:max-w-95 gap-0 p-0 overflow-hidden rounded-2xl border-gray-200/80 dark:border-gray-700/60">
          <div className="h-1 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-50">
                Assign Seller
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 dark:text-gray-500">
                Order {order.customOrderId || order._id?.slice(0, 10)}
              </DialogDescription>
            </div>
          </div>

          <div className="px-5 py-5 space-y-3">
            {currentSellerName && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 dark:border-blue-800/40 dark:bg-blue-900/10">
                <User className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Currently:{" "}
                  <span className="font-semibold">{currentSellerName}</span>
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Select staff member
              </p>
              <Select
                value={selectedSellerId}
                onValueChange={setSelectedSellerId}
              >
                <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 bg-gray-50/60 text-sm dark:border-gray-700 dark:bg-gray-800/60">
                  <SelectValue placeholder="Choose a seller…" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sellerOptions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No staff users found
                    </div>
                  ) : (
                    sellerOptions.map((u) => (
                      <SelectItem
                        key={u._id}
                        value={u._id}
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{
                              background: `hsl(${[...u.name].reduce(
                                (a, c) => a + c.charCodeAt(0),
                                0,
                              ) % 360
                                },52%,50%)`,
                            }}
                          >
                            {u.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span>{u.name}</span>
                          <span className="text-[10px] text-gray-400">
                            ({u.role})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setSellerDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <button
              onClick={handleSaveSeller}
              disabled={!selectedSellerId || isSaving}
              className={cn(
                "group relative overflow-hidden inline-flex items-center gap-1.5",
                "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
                "transition-all duration-200 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-[200%]"
              />
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                "Assign"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
