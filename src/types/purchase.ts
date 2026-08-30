import { IProduct, IUser } from "@/types";

export type PurchaseStatus =
  | "PENDING"
  | "ORDERED"
  | "SHIPPED"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export interface IProductPurchaseItem {
  product: string | IProduct;

  quantity: number;

  purchasePrice: number;

  subtotal: number;
}

export interface IPurchaseProduct {
  product: {
    _id: string;
    title: string;
    price?: number;
    images?: string[];
  };

  quantity: number;
  buyingPrice: number;
  totalAmount: number;
}

export interface IPurchase {
  _id: string;

  products: IPurchaseProduct[];

  supplierName: string;
  paymentType: "FULL" | "ADVANCE" | "DUE";
  paymentMethod?: string;
  paidAmount: number;
  dueAmount: number;
  supplierPhone?: string;
  supplierAddress?: string;

  grandTotal: number;

  paymentStatus: string;
  purchaseStatus: string;

  invoiceNo?: string;
  reference?: string;
  notes?: string;

  purchaseDate: string;

  createdBy?: IUser;
  updatedBy?: IUser

  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  _id: string;
  product?: { title?: string };
  supplierName: string;
  supplierPhone?: string;
  quantity: number;
  buyingPrice: number;
  totalAmount: number;
  paymentStatus: string;
  purchaseStatus: string;
  invoiceNo?: string;
  purchaseDate: string;
}

export interface IProductPurchase {
  _id?: string;

  purchaseId?: string;

  supplierName: string;

  supplierPhone?: string;

  supplierEmail?: string;

  purchaseDate: string;

  expectedDeliveryDate?: string;

  receivedDate?: string;

  purchaseStatus: PurchaseStatus;

  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";

  paymentMethod?: "CASH" | "BANK" | "MOBILE_BANKING" | "CARD";

  shippingCost?: number;

  discount?: number;

  tax?: number;

  totalAmount: number;

  paidAmount?: number;

  dueAmount?: number;

  notes?: string;

  invoiceNumber?: string;

  purchasedBy?: string | IUser;

  items: IProductPurchaseItem[];

  isDeleted?: boolean;

  createdAt?: string;

  updatedAt?: string;
}
