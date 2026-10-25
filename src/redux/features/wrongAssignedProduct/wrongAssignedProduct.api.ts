import { baseApi } from "../baseApi";
import type {
  GetQueryParams,
  IPaginationMeta,
  IProduct,
  IResponse,
} from "@/types";

export type WrongProductStatus = "OUTSIDE" | "IN_WAREHOUSE";

interface IUserLite {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface IWrongAssignedProduct {
  _id: string;
  order:
    | {
        _id: string;
        customOrderId?: string;
        orderStatus?: string;
        billingDetails?: { fullName?: string; phone?: string };
        createdAt?: string;
      }
    | string;
  orderNumber: string;
  wrongProduct: IProduct; // the product that was sent by mistake
  intendedProduct: IProduct; // the product the customer actually ordered
  quantity: number;
  status: WrongProductStatus;
  returnParcel?: { _id: string; returnStatus?: string; createdAt?: string };
  receivedAt?: string;
  receivedBy?: IUserLite;
  reportedBy?: IUserLite;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWrongAssignedStats {
  total: number;
  OUTSIDE: number;
  IN_WAREHOUSE: number;
}

interface GetAllWrongAssignedResponse {
  success: boolean;
  data: {
    data: IWrongAssignedProduct[];
    stats: IWrongAssignedStats;
  };
  meta: IPaginationMeta;
}

export interface CreateWrongAssignedPayload {
  order: string;
  wrongProduct: string;
  intendedProduct: string;
  quantity?: number;
  notes?: string;
}

export const wrongAssignedProductApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Report a new wrong product
    createWrongAssignedProduct: builder.mutation<
      IResponse<IWrongAssignedProduct>,
      CreateWrongAssignedPayload
    >({
      query: (payload) => ({
        url: "/wrongassignedproduct",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["WRONG_ASSIGNED_PRODUCTS"],
    }),

    // List (with stats)
    getAllWrongAssignedProducts: builder.query<
      GetAllWrongAssignedResponse,
      GetQueryParams
    >({
      query: (params) => ({
        url: "/wrongassignedproduct",
        method: "GET",
        params,
      }),
      providesTags: ["WRONG_ASSIGNED_PRODUCTS"],
    }),

    getSingleWrongAssignedProduct: builder.query<
      IResponse<IWrongAssignedProduct>,
      string
    >({
      query: (id) => ({
        url: `/wrongassignedproduct/${id}`,
        method: "GET",
      }),
      providesTags: ["WRONG_ASSIGNED_PRODUCTS"],
    }),

    // Manual status / notes update
    updateWrongAssignedProduct: builder.mutation<
      IResponse<IWrongAssignedProduct>,
      { _id: string; status?: WrongProductStatus; notes?: string }
    >({
      query: ({ _id, ...body }) => ({
        url: `/wrongassignedproduct/${_id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["WRONG_ASSIGNED_PRODUCTS"],
    }),

    // Soft delete
    deleteWrongAssignedProduct: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/wrongassignedproduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WRONG_ASSIGNED_PRODUCTS"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateWrongAssignedProductMutation,
  useGetAllWrongAssignedProductsQuery,
  useGetSingleWrongAssignedProductQuery,
  useUpdateWrongAssignedProductMutation,
  useDeleteWrongAssignedProductMutation,
  
} = wrongAssignedProductApi;