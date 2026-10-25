/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown, ImageIcon, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IProduct } from "@/types";
import { cn } from "@/lib/utils";

import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import { useCreateWrongAssignedProductMutation } from "@/redux/features/wrongAssignedProduct/wrongAssignedProduct.api";
import { useLazyGetAllOrdersQuery } from "@/lib/hooks";

const ALL_PRODUCT_LIMIT = 5000;

const schema = z
  .object({
    order: z.string().min(1, "Find and select an order first"),
    intendedProduct: z
      .string()
      .min(1, "Select the product that should have been sent"),
    wrongProduct: z
      .string()
      .min(1, "Select the product that was sent by mistake"),
    quantity: z.preprocess((v) => Number(v), z.number().min(1, "Minimum 1")),
    notes: z.string().optional(),
  })
  .refine((d) => d.intendedProduct !== d.wrongProduct, {
    message: "Wrong product and intended product cannot be the same",
    path: ["wrongProduct"],
  });

type FormValues = z.infer<typeof schema>;

const EMPTY_VALUES = {
  order: "",
  intendedProduct: "",
  wrongProduct: "",
  quantity: 1,
  notes: "",
};

/* ── Small searchable product picker (no extra dependency) ── */
function ProductPicker({
  products,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  products: IProduct[];
  value?: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const selected = products.find((p) => (p._id as string) === value);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return products.slice(0, 50);
    return products
      .filter((p) => p.title?.toLowerCase().includes(t))
      .slice(0, 50);
  }, [products, term]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate text-left">
            {selected ? selected.title : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search product…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        {/* onWheel stopPropagation: lets the list scroll with the mouse wheel
            while this popover is open inside a Dialog */}
        <div
          className="max-h-64 space-y-0.5 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          {filtered.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No products found
            </p>
          )}
          {filtered.map((p) => (
            <button
              type="button"
              key={p._id as string}
              onClick={() => {
                onChange(p._id as string);
                setOpen(false);
                setTerm("");
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                (p._id as string) === value &&
                  "bg-amber-50 dark:bg-amber-900/20",
              )}
            >
              {p.images?.[0] ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
                </div>
              )}
              <span className="truncate">{p.title}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CreateWrongAssignedProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateWrongAssignedProductModal({
  open,
  onOpenChange,
}: CreateWrongAssignedProductModalProps) {
  const [createRecord, { isLoading }] = useCreateWrongAssignedProductMutation();
  const [findOrders, { isFetching: findingOrder }] = useLazyGetAllOrdersQuery();

  // Only fetch the full product list while the modal is open
  const { data: allProductsData } = useGetAllProductsQuery(
    { limit: ALL_PRODUCT_LIMIT },
    { skip: !open },
  );
  const allProducts: IProduct[] = allProductsData?.data ?? [];

  const [orderQuery, setOrderQuery] = useState("");
  const [foundOrder, setFoundOrder] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: EMPTY_VALUES,
  });

  const intendedProductId = watch("intendedProduct");
  const wrongProductId = watch("wrongProduct");

  // Products of the selected order (resolved to full product objects)
  const orderProducts = useMemo(() => {
    if (!foundOrder?.products) return [];
    return foundOrder.products
      .map((item: any) => {
        const id = String(item.product?._id ?? item.product);
        const product =
          allProducts.find((p) => (p._id as string) === id) ??
          (typeof item.product === "object" ? item.product : undefined);
        return product
          ? { product: product as IProduct, quantity: item.quantity }
          : null;
      })
      .filter(Boolean) as { product: IProduct; quantity: number }[];
  }, [foundOrder, allProducts]);

  const intendedOrdered = orderProducts.find(
    (o) => (o.product._id as string) === intendedProductId,
  );

  const handleClose = () => {
    reset(EMPTY_VALUES);
    setOrderQuery("");
    setFoundOrder(null);
    onOpenChange(false);
  };

  const handleFindOrder = async () => {
    const term = orderQuery.trim();
    if (!term) return;
    try {
      const res: any = await findOrders({
        searchTerm: term,
        limit: 5,
      }).unwrap();
      const orders: any[] = res?.data?.data ?? res?.data ?? [];
      const exact =
        orders.find(
          (o) => o.customOrderId?.toLowerCase() === term.toLowerCase(),
        ) ?? orders[0];

      if (!exact) {
        toast.error("Order not found");
        return;
      }

      setFoundOrder(exact);
      setValue("order", exact._id, { shouldValidate: true });
      setValue("intendedProduct", "");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to find order");
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (intendedOrdered && data.quantity > intendedOrdered.quantity) {
      toast.error(
        `Quantity cannot exceed the ordered quantity (${intendedOrdered.quantity})`,
      );
      return;
    }

    try {
      const res = await createRecord({
        order: data.order,
        intendedProduct: data.intendedProduct,
        wrongProduct: data.wrongProduct,
        quantity: data.quantity,
        notes: data.notes,
      }).unwrap();

      if (res?.success) {
        toast.success("Wrong product reported successfully");
        handleClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to report wrong product");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="text-xl font-bold uppercase tracking-widest">
            Report Wrong Product
          </DialogTitle>
          <DialogDescription className="text-sm tracking-wide text-[#96999A]">
            Record a product that was sent by mistake
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* ORDER LOOKUP */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest">
              Order Number
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number (e.g. FF-1234)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleFindOrder();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFindOrder}
                disabled={findingOrder || !orderQuery.trim()}
                className="shrink-0"
              >
                {findingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Find
              </Button>
            </div>
            {foundOrder && (
              <p className="text-xs text-emerald-600">
                Order {foundOrder.customOrderId} selected
                {foundOrder.billingDetails?.fullName
                  ? ` · ${foundOrder.billingDetails.fullName}`
                  : ""}
              </p>
            )}
            {errors.order && (
              <p className="text-xs text-red-400">{errors.order.message}</p>
            )}
          </div>

          {/* INTENDED PRODUCT (from the order) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest">
              Should have been sent
            </Label>
            <ProductPicker
              products={orderProducts.map((o) => o.product)}
              value={intendedProductId}
              onChange={(id) =>
                setValue("intendedProduct", id, { shouldValidate: true })
              }
              placeholder={
                foundOrder ? "Select from order products" : "Find an order first"
              }
              disabled={!foundOrder}
            />
            {intendedOrdered && (
              <p className="text-xs text-muted-foreground">
                Ordered quantity: {intendedOrdered.quantity}
              </p>
            )}
            {errors.intendedProduct && (
              <p className="text-xs text-red-400">
                {errors.intendedProduct.message}
              </p>
            )}
          </div>

          {/* WRONG PRODUCT (any product) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest">
              Sent by mistake
            </Label>
            <ProductPicker
              products={allProducts}
              value={wrongProductId}
              onChange={(id) =>
                setValue("wrongProduct", id, { shouldValidate: true })
              }
              placeholder="Select the wrongly sent product"
            />
            {errors.wrongProduct && (
              <p className="text-xs text-red-400">
                {errors.wrongProduct.message}
              </p>
            )}
          </div>

          {/* QUANTITY */}
          <div className="max-w-40 space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest">
              Quantity
            </Label>
            <Input
              type="number"
              min={1}
              onWheel={(e) => e.currentTarget.blur()}
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-xs text-red-400">{errors.quantity.message}</p>
            )}
          </div>

          {/* NOTES */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest">
              Notes{" "}
              <span className="font-normal normal-case text-[#96999A]">
                (optional)
              </span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Anything useful about this mistake…"
              className="resize-none"
              {...register("notes")}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reporting...
              </span>
            ) : (
              "Report Wrong Product"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}