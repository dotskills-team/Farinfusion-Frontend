/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse } from "@/types";
import { baseApi } from "../baseApi";
import type {
  Order,
  OrderResponse,
  UpdateOrderRequest,
  GetQueryParams,
} from "@/types/orders";

interface GetAllOrdersResponse {
  success: boolean;
  data: Order[];
  totalCount: number;
  stats: {
    total: number;
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, any>({
      query: (data) => ({
        url: "/order",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ORDERS", "POSSTATS"],
    }),

    getAllOrders: builder.query<GetAllOrdersResponse, GetQueryParams>({
      query: (params) => ({
        url: "/order",
        method: "GET",
        params,
      }),
      providesTags: ["ORDERS"],
    }),

    getAllScheduledOrders: builder.query<GetAllOrdersResponse, GetQueryParams>({
      query: (params) => ({
        url: "/order/scheduled-orders",
        method: "GET",
        params,
      }),
      providesTags: ["ORDERS"],
    }),

    getAllholdOrders: builder.query<GetAllOrdersResponse, GetQueryParams>({
      query: (params) => ({
        url: "/order/hold-orders",
        method: "GET",
        params,
      }),
      providesTags: ["ORDERS"],
    }),

    getAllNoResponseOrders: builder.query<GetAllOrdersResponse, GetQueryParams>(
      {
        query: (params) => ({
          url: "/order/no-response",
          method: "GET",
          params,
        }),
        providesTags: ["ORDERS"],
      },
    ),

    getAllWaitingStockOrders: builder.query<
      GetAllOrdersResponse,
      GetQueryParams
    >({
      query: (params) => ({
        url: "/order/waiting-stock",
        method: "GET",
        params,
      }),
      providesTags: ["ORDERS"],
    }),

    getSingleOrder: builder.query<OrderResponse, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ORDER", id }],
    }),

    updateOrder: builder.mutation<
      OrderResponse,
      { _id: string; data: UpdateOrderRequest }
    >({
      query: ({ _id, data }) => ({
        url: `/order/${_id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
      ],
    }),

    updateSeller: builder.mutation<
      OrderResponse,
      { _id: string; data: UpdateOrderRequest }
    >({
      query: ({ _id, data }) => ({
        url: `/order/${_id}/assign-seller`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
      ],
    }),

    confirmOrder: builder.mutation<
      OrderResponse,
      { _id: string; orderStatus: string }
    >({
      query: ({ _id }) => ({
        url: `/order/${_id}/confirm-status`,
        method: "PATCH",
        data: {
          orderStatus: "CONFIRMED",
        },
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
      ],
    }),

    markNoResponse: builder.mutation<
      OrderResponse,
      { _id: string; orderStatus: string }
    >({
      query: ({ _id }) => ({
        url: `/order/${_id}/no-response`,
        method: "PATCH",
        data: {
          orderStatus: "NO_RESPONSE",
        },
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
      ],
    }),

    restoreNoResponse: builder.mutation<OrderResponse, { _id: string }>({
      query: ({ _id }) => ({
        url: `/order/${_id}/restore-no-response`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
        "PRODUCTS",
      ],
    }),

    completeOrder: builder.mutation<
      OrderResponse,
      { _id: string; orderStatus: string }
    >({
      query: ({ _id }) => ({
        url: `/order/${_id}/status`,
        method: "PATCH",
        data: {
          orderStatus: "COMPLETED",
        },
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
        "COURIERS",
      ],
    }),

    partialUpdateOrder: builder.mutation({
      query: (data) => ({
        url: "/order/partial-update",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ORDERS"],
    }),

    exchangeOrder: builder.mutation({
      query: (data) => ({
        url: "/order/exchange",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ORDERS"],
    }),

    markDamage: builder.mutation({
      query: (data) => ({
        url: "/order/damage",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ORDERS"],
    }),

    deleteOrder: builder.mutation<IResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ORDERS"],
    }),

    getAllDamagedProducts: builder.query({
      query: () => ({
        url: "/order/damaged-products",
        method: "GET",
      }),
    }),

    cancelOrder: builder.mutation<
      any,
      {
        _id: string;
        orderStatus: string;
        deliveryStatus: string;
      }
    >({
      query: ({ _id, ...data }) => ({
        url: `/order/${_id}/cancel-status`,
        method: "PATCH",
        data,
      }),

      invalidatesTags: ["ORDERS", "PRODUCTS"],
    }),

    updateManualDeliveryStatus: builder.mutation({
      query: ({ id, deliveryStatus }) => ({
        url: `/order/manual-delivery-status/${id}`,
        method: "PATCH",
        data: { deliveryStatus },
      }),
      invalidatesTags: ["ORDERS"],
    }),

    updateDeliveryStatus: builder.mutation<
      OrderResponse,
      {
        _id: string;
        deliveryStatus: "NOT_SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
      }
    >({
      query: ({ _id, deliveryStatus }) => ({
        url: `/order/${_id}`,
        method: "PATCH",
        data: { deliveryStatus },
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "ORDER", id: _id },
        "ORDERS",
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useConfirmOrderMutation,
  useMarkNoResponseMutation,
  useRestoreNoResponseMutation,
  useGetAllScheduledOrdersQuery,
  useGetAllNoResponseOrdersQuery,
  useGetAllWaitingStockOrdersQuery,
  useCancelOrderMutation,
  useGetAllDamagedProductsQuery,
  useUpdateDeliveryStatusMutation,
  usePartialUpdateOrderMutation,
  useUpdateManualDeliveryStatusMutation,
  useExchangeOrderMutation,
  useMarkDamageMutation,
  useUpdateSellerMutation,
  useCompleteOrderMutation,
useLazyGetAllOrdersQuery,
  useGetAllholdOrdersQuery,
} = ordersApi;
