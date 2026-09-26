// /* eslint-disable react-hooks/incompatible-library */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useRouter, useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import dynamic from "next/dynamic";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";

// import { Upload, X, Loader2, RefreshCw } from "lucide-react";
// import { toast } from "sonner";
// import { uploadMultipleToCloudinary } from "@/utils/cloudinary";

// import {
//   useUpdateProductMutation,
//   useGetSingleProductQuery,
// } from "@/redux/features/product/product.api";
// import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
// import { useGetAllBrandsQuery } from "@/redux/features/brand/brand.api";

// import { IBrand, ICategory } from "@/types";
// import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
// import { Separator } from "@/components/ui/separator";
// import { useGetMeQuery } from "@/redux/features/user/user.api";
// import { Checkbox } from "@/components/ui/checkbox";

// // Editor
// const ProductEditor = dynamic(
//   () => import("@/components/dashboard/product/ProductEditor"),
//   { ssr: false },
// );

// // ENUM
// enum ProductStatus {
//   ACTIVE = "ACTIVE",
//   INACTIVE = "INACTIVE",
// }

// // VALIDATION
// const schema = z.object({
//   title: z.string().min(2),
//   brand: z.string(),
//   category: z.string(),
//   buyingPrice: z.preprocess(
//     (v) => (v === "" || v === undefined ? undefined : Number(v)),
//     z.number().optional(),
//   ),
//   price: z.preprocess((v) => Number(v), z.number()),
//   totalAddedStock: z.preprocess((v) => Number(v), z.number()),
//   discountPrice: z.preprocess(
//     (v) => (v === "" ? undefined : Number(v)),
//     z.number().optional(),
//   ),
//   status: z.nativeEnum(ProductStatus),
//   description: z.string(),
//   images: z.any().optional(),
//   isCusFavorite: z.enum(["true", "false"]),
//   isBestSelling: z.boolean().default(false),
//   barcode: z.string().optional(),
//   adjustStock: z.preprocess(
//     (v) => (v === "" || v === undefined ? 0 : Number(v)),
//     z.number().optional(),
//   ),
// });

// type FormValues = z.infer<typeof schema>;

// export const generateBarcode = () => {
//   const prefix = "FF";
//   const timestamp = Date.now().toString().slice(-8);
//   const random = Math.floor(1000 + Math.random() * 9000);

//   return `${prefix}${timestamp}${random}`;
// };

// const UpdateProduct = () => {
//   const router = useRouter();
//   const { slug } = useParams();

//   const [updateProduct, { isLoading }] = useUpdateProductMutation();
//   const { data: user } = useGetMeQuery(undefined);
//   const role = user?.data?.role;
//   const permissions = user?.data?.permissions || [];
//   const canAdjustStock =
//     role === "ADMIN" || permissions.includes("product-stock-adjustment");

//   const { data: productData } = useGetSingleProductQuery(slug as string);

//   const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
//   const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });

//   const categories = categoriesData?.data || [];
//   const brands = brandsData?.data || [];

//   const id = productData?.data?._id;

//   const {
//     register,
//     control,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     setError,
//     clearErrors,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(schema) as any,
//   });

//   // Watch adjustStock for real-time calculation
//   const adjustStockValue = watch("adjustStock") || 0;
//   const currentStock = Number(productData?.data?.availableStock || 0);
//   const adjustValue = Number(adjustStockValue || 0);
//   const newStock = currentStock + adjustValue;


//   // Image state
//   const [previews, setPreviews] = useState<string[]>([]);
//   const [oldImages, setOldImages] = useState<string[]>([]);
//   const [newFiles, setNewFiles] = useState<File[]>([]);
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const getId = (
//     val: string | { _id?: string; slug?: string; title?: string },
//   ) => (typeof val === "string" ? val : val._id || val.slug || "");

//   useEffect(() => {
//     if (productData?.data) {
//       const p = productData.data;

//       reset({
//         title: p.title,
//         brand: getId(p?.brand),
//         category: getId(p.category),
//         buyingPrice: p.buyingPrice,
//         price: p.price,
//         discountPrice: p.discountPrice,
//         totalAddedStock: p.totalAddedStock,
//         status: p.status,
//         description: p.description,
//         barcode: p.barcode || "",
//         isCusFavorite: p?.isCusFavorite === true ? "true" : "false",
//         isBestSelling: !!p?.isBestSelling,
//       });

//       setTimeout(() => {
//         setOldImages(p.images || []);
//       }, 100);
//     }
//   }, [productData, reset]);

//   useEffect(() => {
//     if (newStock < 0) {
//       setError("adjustStock", {
//         type: "manual",
//         message: "Stock cannot be negative",
//       });
//     } else {
//       clearErrors("adjustStock");
//     }
//   }, [newStock, setError, clearErrors]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);

//     // Limit to 10 total images (old + new)
//     const totalImages = oldImages.length + newFiles.length + files.length;
//     if (totalImages > 10) {
//       toast.error(
//         `Maximum 10 images allowed. You have ${oldImages.length + newFiles.length}`,
//       );
//       return;
//     }

//     const updatedFiles = [...newFiles, ...files];
//     setNewFiles(updatedFiles);

//     // Append new previews
//     const urls = files.map((f) => URL.createObjectURL(f));
//     setPreviews((prev) => [...prev, ...urls]);

//     setValue("images", updatedFiles);
//   };

//   const removeOldImage = (index: number) => {
//     const updated = [...oldImages];
//     updated.splice(index, 1);
//     setOldImages(updated);
//   };

//   const removeNewImage = (index: number) => {
//     const updatedFiles = [...newFiles];
//     updatedFiles.splice(index, 1);
//     setNewFiles(updatedFiles);
//     setValue("images", updatedFiles);

//     const updatedPreview = [...previews];
//     updatedPreview.splice(index, 1);
//     setPreviews(updatedPreview);
//   };

//   const onSubmit = async (data: FormValues) => {
//     try {
//       if (currentStock + adjustValue < 0) {
//         toast.error("Stock cannot be negative");
//         return;
//       }
//       setUploadingImages(true);
//       setUploadProgress(0);

//       let newImageUrls: string[] = [];
//       if (newFiles.length > 0) {
//         newImageUrls = await uploadMultipleToCloudinary(newFiles);
//         setUploadProgress(50);
//       }

//       const allImages = [...oldImages, ...newImageUrls];

//       const formData = new FormData();

//       const payloadData: any = {
//         title: data.title,
//         brand: data.brand,
//         category: data.category,
//         price: data.price,
//         discountPrice: data.discountPrice,
//         status: data.status,
//         description: data.description,
//         isCusFavorite: data.isCusFavorite === "true",
//         isBestSelling: data.isBestSelling,
//         images: allImages,
//         barcode: data.barcode,
//       };

//       // Add stock adjustment if provided
//       // if (data.adjustStock && data.adjustStock !== 0) {
//       //   const currentStock = Number(productData?.data?.availableStock || 0);
//       //   const adjustValue = Number(data.adjustStock || 0);

//       //   const updatedStock = currentStock + adjustValue;

//       //   payloadData.totalAddedStock = updatedStock;
//       // }

//       if (data.adjustStock && data.adjustStock !== 0) {
//         payloadData.totalAddedStock = Number(data.adjustStock);
//       }

//       if (role === "ADMIN" && data.buyingPrice !== undefined) {
//         payloadData.buyingPrice = data.buyingPrice;
//       }

//       formData.append("data", JSON.stringify(payloadData));

//       setUploadProgress(80);

//       const res = await updateProduct({
//         _id: id as string,
//         formData,
//       }).unwrap();

//       if (res?.success) {
//         setUploadProgress(100);
//         toast.success("Product updated successfully!");
//         router.push("/staff/dashboard/admin/product-management");
//       }
//     } catch (err: any) {
//       console.error("Update product error:", err);
//       toast.error(err?.data?.message || "Update failed");
//       setUploadingImages(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="p-3 max-w-5xl mx-auto">
//       <Card>
//         <CardHeader className={"text-center"}>
//           <DashboardPageHeader title={"Update Product"} />
//         </CardHeader>
//         <Separator />

//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* TITLE */}
//             <div className={"space-y-2"}>
//               <Label>Title</Label>
//               <Input {...register("title")} />
//               <p className="text-red-500 text-xs">{errors.title?.message}</p>
//             </div>

//             {/* BRAND + CATEGORY */}
//             <div className="grid md:grid-cols-4 gap-4">
//               <div className={"space-y-2"}>
//                 <Label>Brand</Label>
//                 <Controller
//                   control={control}
//                   name="brand"
//                   render={({ field }) => (
//                     <Select
//                       value={field.value}
//                       key={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Brand" />
//                       </SelectTrigger>
//                       <SelectContent position={"popper"}>
//                         {brands.map((b: IBrand) => (
//                           <SelectItem key={b._id} value={b._id}>
//                             {b.title}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//               </div>

//               <div className={"space-y-2"}>
//                 <Label>Category</Label>
//                 <Controller
//                   control={control}
//                   name="category"
//                   render={({ field }) => (
//                     <Select
//                       value={field.value}
//                       key={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Category" />
//                       </SelectTrigger>
//                       <SelectContent position={"popper"}>
//                         {categories.map((c: ICategory) => (
//                           <SelectItem key={c._id} value={c._id}>
//                             {c.title}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//               </div>

//               <div className={"space-y-2"}>
//                 <Label>Product Status</Label>

//                 <Controller
//                   control={control}
//                   name="status"
//                   render={({ field }) => (
//                     <Select
//                       value={field.value}
//                       key={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>

//                       <SelectContent position={"popper"}>
//                         {Object.values(ProductStatus).map((status) => (
//                           <SelectItem key={status} value={status}>
//                             {status}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//               </div>

//               <div className={"space-y-2"}>
//                 <Label>Favorite Status</Label>

//                 <Controller
//                   control={control}
//                   name="isCusFavorite"
//                   render={({ field }) => (
//                     <Select
//                       value={field.value}
//                       key={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>

//                       <SelectContent position={"popper"}>
//                         <SelectItem value="true">Favorite</SelectItem>
//                         <SelectItem value="false">Not Favorite</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//               </div>
//             </div>
//             <div className="space-y-2 max-w-lg">
//               <Label>Best Selling Product</Label>

//               <Controller
//                 control={control}
//                 name="isBestSelling"
//                 render={({ field }) => (
//                   <div className="flex items-center space-x-3 rounded-lg border p-4">
//                     <Checkbox
//                       checked={field.value}
//                       onCheckedChange={(checked) =>
//                         field.onChange(checked === true)
//                       }
//                     />

//                     <div className="space-y-1">
//                       <p className="text-sm font-medium">
//                         Show as Best Selling Product
//                       </p>

//                       <p className="text-xs text-muted-foreground">
//                         Enable this to display the product in the Best Selling
//                         section on the homepage.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               />
//             </div>

//             {/* PRICE */}
//             <div className="grid md:grid-cols-4 gap-4">
//               {role === "ADMIN" && (
//                 <div className="space-y-2">
//                   <Label>Buying Price</Label>
//                   <Input
//                     type="number"
//                     onWheel={(e) => e.currentTarget.blur()}
//                     {...register("buyingPrice")}
//                   />
//                   <p className="text-red-500 text-xs">
//                     {errors.buyingPrice?.message}
//                   </p>
//                 </div>
//               )}
//               <div className={"space-y-2"}>
//                 <Label>Price</Label>
//                 <Input
//                   type="number"
//                   onWheel={(e) => e.currentTarget.blur()}
//                   placeholder="Price"
//                   {...register("price")}
//                 />
//               </div>
//               <div className={"space-y-2"}>
//                 <Label>Discount Price</Label>
//                 <Input
//                   type="number"
//                   onWheel={(e) => e.currentTarget.blur()}
//                   placeholder="Discount"
//                   {...register("discountPrice")}
//                 />
//               </div>
//               <div className={"space-y-2"}>
//                 <Label>Total Stock</Label>
//                 <Input
//                   readOnly
//                   type="number"
//                   onWheel={(e) => e.preventDefault()}
//                   placeholder="Stock"
//                   {...register("totalAddedStock")}
//                 />
//               </div>
//             </div>

//             {/* STOCK ADJUSTMENT */}

//             {/* {canAdjustStock && (
              
//               <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                 <div className="space-y-3">
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//                       Adjust Stock
//                     </h3>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       Current stock:{" "}
//                       <span className="font-bold text-blue-600 dark:text-blue-400">
//                         {productData?.data?.availableStock || 0}
//                       </span>{" "}
//                       units
//                     </p>
//                   </div>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Adjust By (Add/Subtract)</Label>
//                       <Input
//                         type="number"
//                         onWheel={(e) => e.currentTarget.blur()}
//                         placeholder="e.g., 5 to add, -5 to subtract"
//                         {...register("adjustStock")}
//                         className="border-amber-200 focus:border-amber-400 dark:border-amber-800/40 dark:focus:border-amber-600"
//                       />
//                       <p className="text-[11px] text-gray-500 dark:text-gray-400">
//                         Enter positive number to add stock, negative to remove
//                       </p>
//                       {errors.adjustStock && (
//                         <p className="text-red-500 text-xs">
//                           {errors.adjustStock.message}
//                         </p>
//                       )}
//                     </div>
//                     <div className="space-y-2">
//                       <Label>New Stock Total</Label>
//                       <div className="relative">
//                         <Input
//                           type="number"
//                           onWheel={(e) => e.preventDefault()}
//                           disabled
//                           value={newStock}
//                           className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
//                         />
//                         <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
//                           Calculated automatically
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )} */}

//             {canAdjustStock && (
//               <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                 <div className="space-y-3">
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//                       Adjust Stock
//                     </h3>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       Current stock:{" "}
//                       <span className="font-bold text-blue-600 dark:text-blue-400">
//                         {productData?.data?.availableStock || 0}
//                       </span>{" "}
//                       units
//                     </p>
//                   </div>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Adjust By (Add/Subtract)</Label>
//                       <Input
//                         type="number"
//                         onWheel={(e) => e.currentTarget.blur()}
//                         placeholder="e.g., 5 to add, -5 to subtract"
//                         {...register("adjustStock")}
//                         className="border-amber-200 focus:border-amber-400 dark:border-amber-800/40 dark:focus:border-amber-600"
//                       />
//                       <p className="text-[11px] text-gray-500 dark:text-gray-400">
//                         Enter positive number to add stock, negative to remove
//                       </p>
//                       {errors.adjustStock && (
//                         <p className="text-red-500 text-xs">
//                           {errors.adjustStock.message}
//                         </p>
//                       )}
//                     </div>
//                     <div className="space-y-2">
//                       <Label>New Stock Total</Label>
//                       <div className="relative">
//                         <Input
//                           type="number"
//                           onWheel={(e) => e.preventDefault()}
//                           disabled
//                           value={newStock}
//                           className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
//                         />
//                         <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
//                           Calculated automatically
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* LAST STOCK ADJUSTMENT INFO */}
//                   {typeof productData?.data?.lastAddedStock === "number" &&
//                     productData.data.lastAddedStock !== 0 && (
//                       <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
//                         <p className="text-xs text-gray-600 dark:text-gray-400">
//                           Last adjusted by{" "}
//                           <span className="font-medium text-foreground">
//                             {productData.data.lastStockUpdatedBy?.name ||
//                               `${productData.data.lastStockUpdatedBy?.name || ""}`.trim() ||
//                               "N/A"}{" "}
//                           </span>
//                           on{" "}
//                           {productData.data.lastStockUpdatedAt
//                             ? new Date(
//                               productData.data.lastStockUpdatedAt,
//                             ).toLocaleString("en-GB", {
//                               dateStyle: "medium",
//                               timeStyle: "short",
//                             })
//                             : "N/A"}
//                         </p>

//                         <span
//                           className={`text-sm font-bold ${productData.data.lastAddedStock >= 0
//                               ? "text-emerald-600"
//                               : "text-red-500"
//                             }`}
//                         >
//                           {productData.data.lastAddedStock >= 0 ? "+" : ""}
//                           {productData.data.lastAddedStock} pcs
//                         </span>
//                       </div>
//                     )}
//                 </div>
//               </div>
//             )}
//             <div className="space-y-2">
//               <Label>Barcode</Label>

//               <div className="flex gap-2">
//                 <Input placeholder="Barcode" {...register("barcode")} />

//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setValue("barcode", generateBarcode())}
//                 >
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Generate
//                 </Button>
//               </div>
//             </div>

//             {/* DESCRIPTION */}
//             <div className={"space-y-2"}>
//               <Label>Description</Label>
//               <Controller
//                 name="description"
//                 control={control}
//                 render={({ field }) => (
//                   <ProductEditor
//                     content={field.value || ""}
//                     onChange={field.onChange}
//                   />
//                 )}
//               />
//             </div>
//             {/* OLD IMAGES - CRITICAL FIX: Only remove, don't replace */}
//             {oldImages.length > 0 && (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <Label>Existing Images ({oldImages.length})</Label>
//                 </div>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
//                   {oldImages.map((img, i) => (
//                     <div
//                       key={`old-${i}`}
//                       className="group relative w-full aspect-square rounded-lg overflow-hidden border border-amber-200/30 dark:border-amber-900/30 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all duration-200"
//                     >
//                       <Image
//                         src={img}
//                         alt={`existing-${i}`}
//                         fill
//                         className="object-cover group-hover:scale-110 transition-transform duration-300"
//                       />

//                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
//                         <button
//                           type="button"
//                           disabled={uploadingImages}
//                           onClick={() => removeOldImage(i)}
//                           className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="Remove this image"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>

//                       <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium">
//                         E{i + 1}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* NEW IMAGES */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <Label>Add New Images</Label>
//                 <span className="text-xs text-muted-foreground">
//                   Total: {oldImages.length + newFiles.length}/10
//                 </span>
//               </div>

//               <label className="border-2 border-dashed border-amber-200/50 dark:border-amber-900/50 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-amber-500/80 dark:hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all duration-300 active:scale-95">
//                 <div className="relative mb-3">
//                   <Upload className="w-8 h-8 text-amber-600 dark:text-amber-400" />
//                 </div>
//                 <span className="text-sm font-medium text-foreground">
//                   Drop new images or click to upload
//                 </span>
//                 <span className="text-xs text-muted-foreground mt-1">
//                   PNG, JPG, WebP up to 10MB each
//                 </span>

//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   disabled={uploadingImages}
//                   className="hidden"
//                   onChange={handleImageChange}
//                 />
//               </label>

//               {/* Upload Progress */}
//               {uploadingImages && (
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
//                     <span className="text-sm text-muted-foreground">
//                       Uploading to Cloudinary... {uploadProgress}%
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
//                     <div
//                       className="bg-linear-to-r from-amber-500 to-amber-600 h-full transition-all duration-300"
//                       style={{ width: `${uploadProgress}%` }}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* New Images Preview Grid */}
//               {previews.length > 0 && (
//                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
//                   {previews.map((src, i) => (
//                     <div
//                       key={`new-${i}`}
//                       className="group relative w-full aspect-square rounded-lg overflow-hidden border border-amber-200/30 dark:border-amber-900/30 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all duration-200"
//                     >
//                       <Image
//                         src={src}
//                         alt={`new-preview-${i}`}
//                         fill
//                         className="object-cover group-hover:scale-110 transition-transform duration-300"
//                       />

//                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
//                         <button
//                           type="button"
//                           disabled={uploadingImages}
//                           onClick={() => removeNewImage(i)}
//                           className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="Remove this image"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>

//                       <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium">
//                         N{i + 1}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <Button
//               className="hover:cursor-pointer w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
//               type="submit"
//               disabled={isLoading || uploadingImages}
//             >
//               {uploadingImages ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Uploading Images...
//                 </>
//               ) : isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Updating Product...
//                 </>
//               ) : (
//                 "Update Product"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default UpdateProduct;





// v2

/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Upload, X, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { uploadMultipleToCloudinary } from "@/utils/cloudinary";

import {
  useUpdateProductMutation,
  useGetSingleProductQuery,
} from "@/redux/features/product/product.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { useGetAllBrandsQuery } from "@/redux/features/brand/brand.api";

import { IBrand, ICategory } from "@/types";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { Separator } from "@/components/ui/separator";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import { Checkbox } from "@/components/ui/checkbox";

// Editor
const ProductEditor = dynamic(
  () => import("@/components/dashboard/product/ProductEditor"),
  { ssr: false },
);

// ENUM
enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// VALIDATION
const schema = z.object({
  title: z.string().min(2),
  brand: z.string(),
  category: z.array(z.string()).min(1, "Select at least one category"),
  buyingPrice: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
  price: z.preprocess((v) => Number(v), z.number()),
  totalAddedStock: z.preprocess((v) => Number(v), z.number()),
  discountPrice: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z.number().optional(),
  ),
  status: z.nativeEnum(ProductStatus),
  description: z.string(),
  images: z.any().optional(),
  isCusFavorite: z.enum(["true", "false"]),
  isBestSelling: z.boolean().default(false),
  barcode: z.string().optional(),
  adjustStock: z.preprocess(
    (v) => (v === "" || v === undefined ? 0 : Number(v)),
    z.number().optional(),
  ),
});

type FormValues = z.infer<typeof schema>;

export const generateBarcode = () => {
  const prefix = "FF";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}${timestamp}${random}`;
};

const UpdateProduct = () => {
  const router = useRouter();
  const { slug } = useParams();

  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const { data: user } = useGetMeQuery(undefined);
  const role = user?.data?.role;
  const permissions = user?.data?.permissions || [];
  const canAdjustStock =
    role === "ADMIN" || permissions.includes("product-stock-adjustment");

  const { data: productData } = useGetSingleProductQuery(slug as string);

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const id = productData?.data?._id;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  // Watch adjustStock for real-time calculation
  const adjustStockValue = watch("adjustStock") || 0;
  const currentStock = Number(productData?.data?.availableStock || 0);
  const adjustValue = Number(adjustStockValue || 0);
  const newStock = currentStock + adjustValue;

  // Image state
  const [previews, setPreviews] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  const getId = (
    val: string | { _id?: string; slug?: string; title?: string },
  ) => (typeof val === "string" ? val : val._id || val.slug || "");

  // category can come back as array of populated objects, array of ids, or (legacy) a single value
  const getIds = (
    val:
      | string
      | { _id?: string; slug?: string; title?: string }
      | (string | { _id?: string; slug?: string; title?: string })[]
      | undefined,
  ): string[] => {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : [val];
    return arr.map(getId).filter(Boolean);
  };

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;

      reset({
        title: p.title,
        brand: getId(p?.brand),
        category: getIds(p.category),
        buyingPrice: p.buyingPrice,
        price: p.price,
        discountPrice: p.discountPrice,
        totalAddedStock: p.totalAddedStock,
        status: p.status,
        description: p.description,
        barcode: p.barcode || "",
        isCusFavorite: p?.isCusFavorite === true ? "true" : "false",
        isBestSelling: !!p?.isBestSelling,
      });

      setTimeout(() => {
        setOldImages(p.images || []);
      }, 100);
    }
  }, [productData, reset]);

  useEffect(() => {
    if (newStock < 0) {
      setError("adjustStock", {
        type: "manual",
        message: "Stock cannot be negative",
      });
    } else {
      clearErrors("adjustStock");
    }
  }, [newStock, setError, clearErrors]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Limit to 10 total images (old + new)
    const totalImages = oldImages.length + newFiles.length + files.length;
    if (totalImages > 10) {
      toast.error(
        `Maximum 10 images allowed. You have ${oldImages.length + newFiles.length}`,
      );
      return;
    }

    const updatedFiles = [...newFiles, ...files];
    setNewFiles(updatedFiles);

    // Append new previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);

    setValue("images", updatedFiles);
  };

  const removeOldImage = (index: number) => {
    const updated = [...oldImages];
    updated.splice(index, 1);
    setOldImages(updated);
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = [...newFiles];
    updatedFiles.splice(index, 1);
    setNewFiles(updatedFiles);
    setValue("images", updatedFiles);

    const updatedPreview = [...previews];
    updatedPreview.splice(index, 1);
    setPreviews(updatedPreview);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (currentStock + adjustValue < 0) {
        toast.error("Stock cannot be negative");
        return;
      }
      setUploadingImages(true);
      setUploadProgress(0);

      let newImageUrls: string[] = [];
      if (newFiles.length > 0) {
        newImageUrls = await uploadMultipleToCloudinary(newFiles);
        setUploadProgress(50);
      }

      const allImages = [...oldImages, ...newImageUrls];

      const formData = new FormData();

      const payloadData: any = {
        title: data.title,
        brand: data.brand,
        category: data.category,
        price: data.price,
        discountPrice: data.discountPrice,
        status: data.status,
        description: data.description,
        isCusFavorite: data.isCusFavorite === "true",
        isBestSelling: data.isBestSelling,
        images: allImages,
        barcode: data.barcode,
      };

      if (data.adjustStock && data.adjustStock !== 0) {
        payloadData.totalAddedStock = Number(data.adjustStock);
      }

      if (role === "ADMIN" && data.buyingPrice !== undefined) {
        payloadData.buyingPrice = data.buyingPrice;
      }

      formData.append("data", JSON.stringify(payloadData));

      setUploadProgress(80);

      const res = await updateProduct({
        _id: id as string,
        formData,
      }).unwrap();

      if (res?.success) {
        setUploadProgress(100);
        toast.success("Product updated successfully!");
        router.push("/staff/dashboard/admin/product-management");
      }
    } catch (err: any) {
      console.error("Update product error:", err);
      toast.error(err?.data?.message || "Update failed");
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-3 max-w-5xl mx-auto">
      <Card>
        <CardHeader className={"text-center"}>
          <DashboardPageHeader title={"Update Product"} />
        </CardHeader>
        <Separator />

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* TITLE */}
            <div className={"space-y-2"}>
              <Label>Title</Label>
              <Input {...register("title")} />
              <p className="text-red-500 text-xs">{errors.title?.message}</p>
            </div>

            {/* BRAND + CATEGORY */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className={"space-y-2"}>
                <Label>Brand</Label>
                <Controller
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      key={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Brand" />
                      </SelectTrigger>
                      <SelectContent position={"popper"}>
                        {brands.map((b: IBrand) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className={"space-y-2"}>
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => {
                    const selected: string[] = field.value || [];

                    const toggleCategory = (catId: string) => {
                      if (selected.includes(catId)) {
                        field.onChange(selected.filter((c) => c !== catId));
                      } else {
                        field.onChange([...selected, catId]);
                      }
                    };

                    const selectedTitles = categories
                      .filter((c: ICategory) => selected.includes(c._id!))
                      .map((c: ICategory) => c.title);

                    return (
                      <Popover
                        open={categoryPopoverOpen}
                        onOpenChange={setCategoryPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            <span className="truncate text-left">
                              {selectedTitles.length > 0
                                ? selectedTitles.join(", ")
                                : "Select category"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-2 max-h-72 overflow-y-auto"
                          align="start"
                        >
                          <div className="space-y-1">
                            {categories.map((c: ICategory) => (
                              <label
                                key={c._id}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer text-sm"
                              >
                                <Checkbox
                                  checked={selected.includes(c._id!)}
                                  onCheckedChange={() =>
                                    toggleCategory(c._id!)
                                  }
                                />
                                {c.title}
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />

                {/* Selected category badges */}
                {(watch("category") || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(watch("category") || []).map((catId) => {
                      const cat = categories.find(
                        (c: ICategory) => c._id === catId,
                      );
                      if (!cat) return null;
                      return (
                        <Badge key={catId} variant="secondary">
                          {cat.title}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <p className="text-red-500 text-xs">
                  {errors.category?.message as string}
                </p>
              </div>

              <div className={"space-y-2"}>
                <Label>Product Status</Label>

                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      key={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent position={"popper"}>
                        {Object.values(ProductStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className={"space-y-2"}>
                <Label>Favorite Status</Label>

                <Controller
                  control={control}
                  name="isCusFavorite"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      key={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent position={"popper"}>
                        <SelectItem value="true">Favorite</SelectItem>
                        <SelectItem value="false">Not Favorite</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2 max-w-lg">
              <Label>Best Selling Product</Label>

              <Controller
                control={control}
                name="isBestSelling"
                render={({ field }) => (
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />

                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Show as Best Selling Product
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Enable this to display the product in the Best Selling
                        section on the homepage.
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* PRICE */}
            <div className="grid md:grid-cols-4 gap-4">
              {role === "ADMIN" && (
                <div className="space-y-2">
                  <Label>Buying Price</Label>
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    {...register("buyingPrice")}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.buyingPrice?.message}
                  </p>
                </div>
              )}
              <div className={"space-y-2"}>
                <Label>Price</Label>
                <Input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Price"
                  {...register("price")}
                />
              </div>
              <div className={"space-y-2"}>
                <Label>Discount Price</Label>
                <Input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Discount"
                  {...register("discountPrice")}
                />
              </div>
              <div className={"space-y-2"}>
                <Label>Total Stock</Label>
                <Input
                  readOnly
                  type="number"
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Stock"
                  {...register("totalAddedStock")}
                />
              </div>
            </div>

            {canAdjustStock && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Adjust Stock
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Current stock:{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {productData?.data?.availableStock || 0}
                      </span>{" "}
                      units
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Adjust By (Add/Subtract)</Label>
                      <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="e.g., 5 to add, -5 to subtract"
                        {...register("adjustStock")}
                        className="border-amber-200 focus:border-amber-400 dark:border-amber-800/40 dark:focus:border-amber-600"
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Enter positive number to add stock, negative to remove
                      </p>
                      {errors.adjustStock && (
                        <p className="text-red-500 text-xs">
                          {errors.adjustStock.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>New Stock Total</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          onWheel={(e) => e.preventDefault()}
                          disabled
                          value={newStock}
                          className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                        />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Calculated automatically
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LAST STOCK ADJUSTMENT INFO */}
                  {typeof productData?.data?.lastAddedStock === "number" &&
                    productData.data.lastAddedStock !== 0 && (
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Last adjusted by{" "}
                          <span className="font-medium text-foreground">
                            {productData.data.lastStockUpdatedBy?.name ||
                              `${productData.data.lastStockUpdatedBy?.name || ""}`.trim() ||
                              "N/A"}{" "}
                          </span>
                          on{" "}
                          {productData.data.lastStockUpdatedAt
                            ? new Date(
                              productData.data.lastStockUpdatedAt,
                            ).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                            : "N/A"}
                        </p>

                        <span
                          className={`text-sm font-bold ${productData.data.lastAddedStock >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                            }`}
                        >
                          {productData.data.lastAddedStock >= 0 ? "+" : ""}
                          {productData.data.lastAddedStock} pcs
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Barcode</Label>

              <div className="flex gap-2">
                <Input placeholder="Barcode" {...register("barcode")} />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("barcode", generateBarcode())}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className={"space-y-2"}>
              <Label>Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ProductEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            {/* OLD IMAGES - CRITICAL FIX: Only remove, don't replace */}
            {oldImages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Existing Images ({oldImages.length})</Label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {oldImages.map((img, i) => (
                    <div
                      key={`old-${i}`}
                      className="group relative w-full aspect-square rounded-lg overflow-hidden border border-amber-200/30 dark:border-amber-900/30 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all duration-200"
                    >
                      <Image
                        src={img}
                        alt={`existing-${i}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          disabled={uploadingImages}
                          onClick={() => removeOldImage(i)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove this image"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium">
                        E{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Add New Images</Label>
                <span className="text-xs text-muted-foreground">
                  Total: {oldImages.length + newFiles.length}/10
                </span>
              </div>

              <label className="border-2 border-dashed border-amber-200/50 dark:border-amber-900/50 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-amber-500/80 dark:hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all duration-300 active:scale-95">
                <div className="relative mb-3">
                  <Upload className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Drop new images or click to upload
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP up to 10MB each
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploadingImages}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {/* Upload Progress */}
              {uploadingImages && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span className="text-sm text-muted-foreground">
                      Uploading to Cloudinary... {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-amber-500 to-amber-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* New Images Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {previews.map((src, i) => (
                    <div
                      key={`new-${i}`}
                      className="group relative w-full aspect-square rounded-lg overflow-hidden border border-amber-200/30 dark:border-amber-900/30 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all duration-200"
                    >
                      <Image
                        src={src}
                        alt={`new-preview-${i}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          disabled={uploadingImages}
                          onClick={() => removeNewImage(i)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove this image"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium">
                        N{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              className="hover:cursor-pointer w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Images...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateProduct;