/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProduct } from ".";
import { Order } from "./orders";

export interface ReturnParcel {
  _id: string;
  order?: Order;
  products: {
    product: IProduct;
    quantity: number;
    returnReason?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  refundAmount?: number;
  refundStatus: "PENDING" | "REFUNDED" | "NOT_APPLICABLE";
  returnStatus:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "CANCELLED";
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllReturnsResponse {
  success: boolean;
  data: {
   data: ReturnParcel[];
   stats: {
     total: number;
     PENDING: number;
     PROCESSING: number;
     COMPLETED: number;
     totalRefunded: number;
   };
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}