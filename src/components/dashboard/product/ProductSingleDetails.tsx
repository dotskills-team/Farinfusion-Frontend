/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Barcode from "react-barcode";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams, useRouter } from "next/navigation";
import {
  useGetSingleProductQuery,
  useAssignMissingBarcodesMutation,
} from "@/redux/features/product/product.api";
import {
  AlertCircle,
  CheckIcon,
  Copy,
  Check,
  Printer,
  Download,
  Barcode as BarcodeIcon,
  Loader2,
  ScanLine,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import ProductGallery from "@/components/shared/ProductGallery";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserInfo = ({ user }: { user?: any }) => {
  if (!user) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const name =
    user.name ||
    user.fullName ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const initials =
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA";

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.profileImage} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{user.role}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
};

function useBarcodeActions(barcodeValue: string | undefined) {
  const barcodeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copyBarcode = useCallback(async () => {
    if (!barcodeValue) return;
    try {
      await navigator.clipboard.writeText(barcodeValue);
      setCopied(true);
      toast.success("Barcode copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy barcode");
    }
  }, [barcodeValue]);

  const printBarcode = useCallback(() => {
    if (!barcodeValue || !barcodeRef.current) return;

    const svgEl = barcodeRef.current.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const printWindow = window.open("", "_blank", "width=500,height=400");
    if (!printWindow) {
      toast.error("Allow popups to print the barcode");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode — ${barcodeValue}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex; flex-direction: column;
              align-items: center; justify-content: center;
              min-height: 100vh; font-family: monospace;
              background: #fff;
            }
            .label {
              font-size: 11px; color: #555; margin-bottom: 8px;
              letter-spacing: 0.05em; text-transform: uppercase;
            }
            svg { max-width: 280px; }
            @media print {
              body { min-height: unset; padding: 20mm; }
            }
          </style>
        </head>
        <body>
          <p class="label">Farin Fusion</p>
          ${svgData}
          <script>
            window.onload = () => { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [barcodeValue]);

  const downloadBarcode = useCallback(() => {
    if (!barcodeValue || !barcodeRef.current) return;

    const svgEl = barcodeRef.current.querySelector("svg");
    if (!svgEl) return;

    // Convert SVG → canvas → PNG download
    const canvas = document.createElement("canvas");
    const bbox = svgEl.getBoundingClientRect();
    const scale = 3; // 3× for crisp print quality
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `barcode-${barcodeValue}.png`;
      a.click();
      toast.success("Barcode image downloaded");
    };
    img.src = url;
  }, [barcodeValue]);

  return { barcodeRef, copied, copyBarcode, printBarcode, downloadBarcode };
}

export default function ProductSingleDetails() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, isError, refetch } = useGetSingleProductQuery(slug, {
    skip: !slug,
  });
  const router = useRouter();
  const { data: user } = useGetMeQuery(undefined);
  const [assignBarcodes, { isLoading: isGenerating }] =
    useAssignMissingBarcodesMutation();
  const role = user?.data?.role;
  const product: any = data?.data;

  const { barcodeRef, copied, copyBarcode, printBarcode, downloadBarcode } =
    useBarcodeActions(product?.barcode);

  const handleGenerateBarcode = async () => {
    try {
      await assignBarcodes(undefined).unwrap();
      toast.success("Barcode generated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate barcode");
    }
  };

  const handleOpenPOS = () => {
    router.push(
      `/staff/dashboard/pos?barcode=${encodeURIComponent(product?.barcode ?? "")}`,
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading product…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load product.</span>
      </div>
    );
  }

  const hasBarcode = Boolean(product?.barcode);
  const formatDateTime = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
      : "N/A";

  const lastUpdatedUser = product?.lastStockUpdatedBy;

  const lastUpdatedName =
    lastUpdatedUser?.name ||
    lastUpdatedUser?.fullName ||
    `${lastUpdatedUser?.firstName || ""} ${lastUpdatedUser?.lastName || ""}`.trim();

  const initials =
    lastUpdatedName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA";

  return (
    <div className="p-3 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/staff/dashboard/admin/product-management">
                Product Management
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── LEFT: Gallery ── */}
        <Card className="p-4 space-y-4">
          {product && <ProductGallery product={product} />}
        </Card>

        {/* ── RIGHT: Info ── */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold">{product?.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Brand:{" "}
                <span className="font-medium text-foreground">
                  {typeof product?.brand === "string"
                    ? "—"
                    : product?.brand?.title}
                </span>
                {" · "}
                Category:{" "}
                <span className="font-medium text-foreground">
                  {typeof product?.category === "string"
                    ? "—"
                    : product?.category?.map((c:any) => c.title).join(", ") || "—"}
                </span>
              </p>
            </div>

            {/* Description */}
            <p
              className="text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product?.description || "" }}
            />

            <Separator />

            {/* Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Discount Price
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ৳ {product?.discountPrice || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Regular Price
                </p>
                <p
                  className={`text-xl font-semibold ${product?.discountPrice ? "line-through text-gray-400" : "text-foreground"}`}
                >
                  ৳ {product?.price || 0}
                </p>
              </div>
              {role === "ADMIN" && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Buying Price
                  </p>
                  <p className="text-xl font-semibold">
                    ৳ {product?.buyingPrice || 0}
                  </p>
                </div>
              )}
            </div>

            {/* Stock badge */}
            <div>
              {product?.availableStock > 0 ? (
                <Badge className="flex w-fit items-center gap-2 text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckIcon className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-full p-0.5" />
                  In Stock
                </Badge>
              ) : (
                <Badge className="flex w-fit items-center gap-2 bg-red-500 text-white border-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </Badge>
              )}
            </div>

            <Separator />

            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold">Product Barcode</span>
                </div>

                {hasBarcode && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleOpenPOS}
                      className="hover:cursor-pointer h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                      title="Open POS and add product"
                    >
                      <ScanLine className="h-3.5 w-3.5" />
                      POS
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyBarcode}
                      className="h-8 gap-1.5 text-xs border-gray-200 dark:border-gray-700 hover:border-amber-400 hover:text-amber-600 transition-colors"
                      title="Copy barcode number"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printBarcode}
                      className="h-8 gap-1.5 text-xs border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      title="Print barcode label"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBarcode}
                      className="h-8 gap-1.5 text-xs border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                      title="Download barcode as PNG"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-4">
                {hasBarcode ? (
                  <>
                    {/* Barcode display */}
                    <div
                      ref={barcodeRef}
                      className="flex justify-center rounded-xl border border-gray-100 dark:border-gray-700 bg-white p-4"
                    >
                      <Barcode
                        value={product.barcode}
                        format="CODE128"
                        width={4}
                        height={80}
                        displayValue
                      />
                    </div>

                    {/* Barcode value pill */}
                    {/* <div className="flex items-center justify-center">
                      <code className="flex items-center gap-2 text-sm font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-700 select-all">
                        <BarcodeIcon className="h-4 w-4 opacity-60" />
                        {product.barcode}
                      </code>
                    </div> */}

                    {/* Info block */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                        About This Barcode
                      </p>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          Unique CODE128 format for maximum compatibility
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          Generated automatically at product creation
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          Use for inventory tracking and label printing
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          Scannable with standard barcode readers
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  /* ── No barcode: generate prompt ── */
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <BarcodeIcon className="h-7 w-7 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        No barcode assigned
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This product doesn&apos;t have a barcode yet. Generate
                        one to enable inventory tracking.
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateBarcode}
                      disabled={isGenerating}
                      className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-none"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BarcodeIcon className="h-4 w-4" />
                      )}
                      {isGenerating ? "Generating…" : "Generate Barcode"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Key Info Table ── */}
            <Card className="py-0 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                  <TableRow>
                    <TableHead colSpan={2} className="font-bold text-sm">
                      Key Information
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Status", product?.status],
                    ["Size", product?.size],
                    ["Total Added Stock", product?.totalAddedStock],
                    ["Available Stock", product?.availableStock],
                    ["Total Sold", product?.totalSold],
                  ].map(([label, value]) => (
                    <TableRow key={label as string}>
                      <TableCell className="font-semibold w-44">
                        {label}
                      </TableCell>
                      <TableCell>{value ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}

                  {/* Barcode row with inline copy */}
                  <TableRow className="bg-amber-50/40 dark:bg-amber-900/10">
                    <TableCell className="font-semibold w-44">
                      Barcode Number
                    </TableCell>
                    <TableCell>
                      {hasBarcode ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                            {product.barcode}
                          </code>
                          <button
                            onClick={copyBarcode}
                            title="Copy barcode number"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-600 transition-colors"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* <TableRow>
                    <TableCell className="font-semibold w-44">
                      Last Stock Updated By
                    </TableCell>

                    <TableCell>
                      {lastUpdatedUser ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={lastUpdatedUser.profileImage} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-medium">{lastUpdatedName}</p>

                            <p className="text-xs text-muted-foreground">
                              {lastUpdatedUser.role}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {lastUpdatedUser.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Never Updated
                        </span>
                      )}
                    </TableCell>
                  </TableRow> */}

                  <TableRow>
                    <TableCell className="font-semibold">Created By</TableCell>

                    <TableCell>
                      <UserInfo user={product?.createdBy} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold">
                      Last Updated By
                    </TableCell>

                    <TableCell>
                      <UserInfo user={product?.lastUpdatedBy} />
                    </TableCell>
                  </TableRow>

                  {/* <TableRow>
                    <TableCell className="font-semibold">
                      Last Stock Updated By
                    </TableCell>

                    <TableCell>
                      <UserInfo user={product?.lastStockUpdatedBy} />
                    </TableCell>
                  </TableRow> */}

                  <TableRow>
                    <TableCell className="font-semibold w-44">
                      Last Stock Updated By
                    </TableCell>

                    <TableCell>
                      {lastUpdatedUser ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={lastUpdatedUser.profileImage} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="font-medium">{lastUpdatedName}</p>

                              <p className="text-xs text-muted-foreground">
                                {lastUpdatedUser.role}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {lastUpdatedUser.email}
                              </p>
                            </div>
                          </div>

                          {typeof product?.lastAddedStock === "number" && (
                            <div className="text-right shrink-0">
                              <p
                                className={`text-sm font-bold ${product.lastAddedStock >= 0
                                  ? "text-emerald-600"
                                  : "text-red-500"
                                  }`}
                              >
                                {product.lastAddedStock >= 0 ? "+" : ""}
                                {product.lastAddedStock} pcs
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(product?.lastStockUpdatedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never Updated</span>
                      )}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold w-44">
                      Created Date
                    </TableCell>
                    <TableCell>
                      {product?.createdAt
                        ? formatDateTime(product?.createdAt)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold w-44">
                      Updated Date
                    </TableCell>
                    <TableCell>
                      {product?.lastUpdatedAt
                        ? formatDateTime(product?.lastUpdatedAt)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
