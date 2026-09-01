import { baseApi } from "../baseApi";
import type {
  IResponse,
  GetQueryParams,
  IPaginationMeta,
  IProduct,
} from "@/types";

interface GetAllFoodsResponse {
  success: boolean;
  data: IProduct[];
  meta: IPaginationMeta;
}

// ⭐ Ranked low stock products types
type ProductRankCategory = "HOT" | "MEDIUM" | "NORMAL";

interface IRankedProduct extends IProduct {
  rank: number | null;
  productCategory: ProductRankCategory;
  totalSoldInPeriod: number;
}

interface RankedLowStockData {
  hot: IRankedProduct[];
  medium: IRankedProduct[];
  normal: IRankedProduct[];
  meta: {
    hot: IPaginationMeta;
    medium: IPaginationMeta;
    normal: IPaginationMeta;
  };
  stats: {
    totalStockOut: number;
    hotStockOut: number;
    mediumStockOut: number;
    normalStockOut: number;
  };
}

interface GetRankedLowStockParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  hotPage?: number;
  hotLimit?: number;
  mediumPage?: number;
  mediumLimit?: number;
  normalPage?: number;
  normalLimit?: number;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ⭐ CREATE PRODUCT
    createProduct: builder.mutation<IResponse<IProduct>, FormData>({
      query: (formData) => ({
        url: "/product/create-product",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    // ⭐ UPDATE PRODUCT
    updateProduct: builder.mutation<
      IResponse<IProduct>,
      { _id: string; formData: FormData }
    >({
      query: ({ _id, formData }) => ({
        url: `/product/${_id}`,
        method: "PATCH",
        data: formData,
      }),
      invalidatesTags: (result, error, { _id }) => [
        "PRODUCTS",
        { type: "PRODUCT", _id },
      ],
    }),

    // ⭐ DELETE PRODUCT
    deleteProduct: builder.mutation<IResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "PRODUCTS",
        { type: "PRODUCT", id },
      ],
    }),

    // ⭐ GET SINGLE PRODUCT
    getSingleProduct: builder.query<IResponse<IProduct>, string>({
      query: (slug) => ({
        url: `/product/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "PRODUCT", id: slug }],
    }),

    // ⭐ GET ALL products
    getAllProducts: builder.query<GetAllFoodsResponse, GetQueryParams>({
      query: (params) => ({
        url: "/product/all-products",
        method: "GET",
        params,
      }),
      providesTags: ["PRODUCTS"],
    }),

    // ⭐ GET ALL products
    getAllTrashProducts: builder.query<GetAllFoodsResponse, GetQueryParams>({
      query: (params) => ({
        url: "/product/all-trash-products",
        method: "GET",
        params,
      }),
      providesTags: ["PRODUCTS"],
    }),

    // ⭐ GET RANKED LOW STOCK PRODUCTS (hot / medium / normal)
    getRankedLowStockProducts: builder.query<
      IResponse<RankedLowStockData>,
      GetRankedLowStockParams
    >({
      query: (params) => ({
        url: "/product/ranked-low-stock",
        method: "GET",
        params,
      }),
      providesTags: ["PRODUCTS"],
    }),

    toggleFeatured: builder.mutation({
      query: (id) => ({
        url: `/product/${id}/toggle-featured`,
        method: "PATCH",
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    assignMissingBarcodes: builder.mutation({
      query: () => ({
        url: "/product/assign-missing-barcodes",
        method: "POST",
      }),
      invalidatesTags: ["PRODUCTS"],
    }),



    // ⭐ TRASH UPDATE PRODUCT and Restore both work
    trashUpdateProduct: builder.mutation<IResponse<IProduct>, { _id: string }>({
      query: ({ _id }) => ({
        url: `/product/product-trash/${_id}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { _id }) => [
        "PRODUCTS",
        { type: "PRODUCT", _id },
      ],
    }),


  }),
  overrideExisting: true,
});

export const {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetSingleProductQuery,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useToggleFeaturedMutation,
  useAssignMissingBarcodesMutation,
  useGetAllTrashProductsQuery,
  useTrashUpdateProductMutation,
  useGetRankedLowStockProductsQuery,
  useLazyGetAllProductsQuery
} = productApi;
