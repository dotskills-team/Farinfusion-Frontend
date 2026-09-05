// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useMemo, useState } from "react";
// import { toast } from "sonner";
// import {
//   useGetAllReturnsQuery,
//   useDeleteReturnMutation,
//   useCreateReturnMutation,
//   useUpdateReturnStatusMutation,
// } from "@/redux/features/return/returnApi";
// import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
// import { useGetAllOrdersQuery } from "@/redux/features/orders/ordersApi";
// import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
// import { ReturnStatsCards } from "@/components/dashboard/returns/ReturnStatsCards";
// import { ReturnFilters } from "@/components/dashboard/returns/ReturnFilters";
// import { ReturnTable } from "@/components/dashboard/returns/ReturnTable";
// import { CreateReturnModal } from "@/components/dashboard/returns/CreateReturnModal";
// import { ReturnDetailsModal } from "@/components/dashboard/returns/ReturnDetailsModal";
// import { UpdateReturnStatusModal } from "@/components/dashboard/returns/UpdateReturnStatusModal";
// import TablePagination from "@/components/shared/TablePagination";
// import DashboardManagementPageSkeleton from "@/components/dashboard/DashboardManagePageSkeleton";
// import DeleteAlert from "@/components/dashboard/DeleteAlert";

// interface ReturnFiltersState {
//   searchTerm: string;
//   returnStatus: string;
//   refundStatus: string;
//   dateFrom: string;
//   dateTo: string;
// }

// const ReturnsManagement = () => {
//   const [deleteReturn] = useDeleteReturnMutation();
//   const [createReturn] = useCreateReturnMutation();
//   const [updateReturnStatus] = useUpdateReturnStatusMutation();

//   const [filters, setFilters] = useState<ReturnFiltersState>({
//     searchTerm: "",
//     returnStatus: "",
//     refundStatus: "",
//     dateFrom: "",
//     dateTo: "",
//   });
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const { data, isLoading, isError, refetch } = useGetAllReturnsQuery({
//     ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
//     ...(filters.returnStatus && { returnStatus: filters.returnStatus }),
//     ...(filters.refundStatus && { refundStatus: filters.refundStatus }),
//     page,
//     limit,
//   });

//   const { data: productsData } = useGetAllProductsQuery({ limit: 100000 });

//   // Modal states
//   const [selectedReturn, setSelectedReturn] = useState<any>(null);
//   const [openViewModal, setOpenViewModal] = useState(false);
//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const [openStatusModal, setOpenStatusModal] = useState(false);
//   const [statusModalData, setStatusModalData] = useState<{
//     id: string;
//     returnStatus?: string;
//     refundStatus?: string;
//   } | null>(null);

//   // Delete states
//   const [returnToDelete, setReturnToDelete] = useState<any>(null);
//   const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

//   // Calculate statistics
//   const stats = useMemo(() => {
//     const returns = data?.data || [];
//     const totalReturns = returns.length;
//     const pendingReturns = returns.filter(
//       (r: any) => r.returnStatus === "PENDING",
//     ).length;
//     const processingReturns = returns.filter(
//       (r: any) => r.returnStatus === "PROCESSING",
//     ).length;
//     const completedReturns = returns.filter(
//       (r: any) => r.returnStatus === "COMPLETED",
//     ).length;
//     const totalRefunded = returns.reduce(
//       (sum: number, r: any) => sum + (r.refundAmount || 0),
//       0,
//     );

//     return {
//       totalReturns,
//       pendingReturns,
//       processingReturns,
//       completedReturns,
//       totalRefunded,
//     };
//   }, [data]);

//   const handleDeleteReturn = async () => {
//     if (!returnToDelete?._id) return;

//     try {
//       const result = await deleteReturn(returnToDelete._id).unwrap();
//       if (result.success) {
//         toast.success("Return deleted successfully");
//         refetch();
//       }
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to delete return");
//     } finally {
//       setReturnToDelete(null);
//       setOpenDeleteAlert(false);
//     }
//   };

//   const handleStatusChange = async (
//     returnId: string,
//     returnStatus?: string,
//     refundStatus?: string,
//   ) => {
//     try {
//       const result = await updateReturnStatus({
//         id: returnId,
//         data: {
//           ...(returnStatus && { returnStatus }),
//           ...(refundStatus && { refundStatus }),
//         },
//       }).unwrap();

//       if (result.success) {
//         toast.success("Status updated successfully");
//         refetch();
//         setOpenStatusModal(false);
//       }
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to update status");
//     }
//   };

//   if (isLoading) {
//     return <DashboardManagementPageSkeleton />;
//   }

//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-lg font-semibold text-red-600 dark:text-red-400">
//             Failed to load returns
//           </p>
//           <button
//             onClick={() => refetch()}
//             className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <DashboardPageHeader
//         title="Return Parcel Management"
//         subTitle="Manage customer returned parcels, restocks, and refund workflows"
//         actionLabel="Create Return"
//         onAction={() => setOpenCreateModal(true)}
//       />

//       {/* Stats Cards */}
//       <ReturnStatsCards stats={stats} />

//       {/* Filters */}
//       <ReturnFilters
//         filters={filters}
//         onFiltersChange={setFilters}
//         onReset={() => {
//           setFilters({
//             searchTerm: "",
//             returnStatus: "",
//             refundStatus: "",
//             dateFrom: "",
//             dateTo: "",
//           });
//           setPage(1);
//         }}
//       />

//       {/* Table */}
//       <ReturnTable
//         returns={data?.data || []}
//         isLoading={isLoading}
//         onView={(returnItem) => {
//           setSelectedReturn(returnItem);
//           setOpenViewModal(true);
//         }}
//         onStatusChange={(returnItem) => {
//           setStatusModalData({
//             id: returnItem._id,
//             returnStatus: returnItem.returnStatus,
//             refundStatus: returnItem.refundStatus,
//           });
//           setOpenStatusModal(true);
//         }}
//         onDelete={(returnItem) => {
//           setReturnToDelete(returnItem);
//           setOpenDeleteAlert(true);
//         }}
//       />

//       {/* Pagination */}
//       {data?.meta && (
//         <TablePagination
//           currentPage={page}
//           totalPages={data.meta.totalPage}
//           onPageChange={setPage}
//         />
//       )}

//       {/* Modals */}
//       <CreateReturnModal
//         open={openCreateModal}
//         onOpenChange={setOpenCreateModal}
//         products={productsData?.data || []}
//         onSuccess={() => {
//           refetch();
//           setOpenCreateModal(false);
//         }}
//       />

//       <ReturnDetailsModal
//         open={openViewModal}
//         returnItem={selectedReturn}
//         onOpenChange={setOpenViewModal}
//       />

//       <UpdateReturnStatusModal
//         open={openStatusModal}
//         data={statusModalData}
//         onOpenChange={setOpenStatusModal}
//         onConfirm={(returnStatus, refundStatus) => {
//           if (statusModalData?.id) {
//             handleStatusChange(statusModalData.id, returnStatus, refundStatus);
//           }
//         }}
//       />

//       <DeleteAlert
//         open={openDeleteAlert}
//         onOpenChange={setOpenDeleteAlert}
//         description="Are you sure you want to delete this return parcel? This action cannot be undone."
//         onConfirm={handleDeleteReturn}
//         actionType={"delete"}
//       />
//     </div>
//   );
// };

// export default ReturnsManagement;



/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useGetAllReturnsQuery,
  useDeleteReturnMutation,
  useCreateReturnMutation,
  useUpdateReturnStatusMutation,
} from "@/redux/features/return/returnApi";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import { useGetAllOrdersQuery } from "@/redux/features/orders/ordersApi";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { ReturnStatsCards } from "@/components/dashboard/returns/ReturnStatsCards";
import {
  ReturnFilters,
  type DateFilter,
  type ReturnDateType,
} from "@/components/dashboard/returns/ReturnFilters";
import { ReturnTable } from "@/components/dashboard/returns/ReturnTable";
import { CreateReturnModal } from "@/components/dashboard/returns/CreateReturnModal";
import { ReturnDetailsModal } from "@/components/dashboard/returns/ReturnDetailsModal";
import { UpdateReturnStatusModal } from "@/components/dashboard/returns/UpdateReturnStatusModal";
import TablePagination from "@/components/shared/TablePagination";
import DashboardManagementPageSkeleton from "@/components/dashboard/DashboardManagePageSkeleton";
import DeleteAlert from "@/components/dashboard/DeleteAlert";

interface ReturnFiltersState {
  searchTerm: string;
  returnStatus: string;
  refundStatus: string;
}

const ReturnsManagement = () => {
  const [deleteReturn] = useDeleteReturnMutation();
  const [createReturn] = useCreateReturnMutation();
  const [updateReturnStatus] = useUpdateReturnStatusMutation();

  const [filters, setFilters] = useState<ReturnFiltersState>({
    searchTerm: "",
    returnStatus: "",
    refundStatus: "",
  });
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    from: undefined,
    to: undefined,
  });
  const [dateType, setDateType] = useState<ReturnDateType>("created");
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryArgs = {
    page,
    limit,
    dateType,
    ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
    ...(filters.returnStatus && { returnStatus: filters.returnStatus }),
    ...(filters.refundStatus && { refundStatus: filters.refundStatus }),
    ...(dateFilter.from && {
      "updatedAt[gte]": format(
        dateFilter.from,
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      ),
    }),
    ...(dateFilter.to && {
      "updatedAt[lte]": format(dateFilter.to, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    }),
  };

  const { data, isLoading, isError, refetch } =
    useGetAllReturnsQuery(queryArgs);

  const { data: productsData } = useGetAllProductsQuery({ limit: 100000 });
console.log("Returns data", data?.data);
console.log("Products data", productsData);
  // Modal states
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState<{
    id: string;
    returnStatus?: string;
    refundStatus?: string;
  } | null>(null);

  // Delete states
  const [returnToDelete, setReturnToDelete] = useState<any>(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const stats =  {
      totalReturns : data?.data?.stats?.total || 0,
      pendingReturns: data?.data?.stats?.PENDING || 0,
      processingReturns: data?.data?.stats?.PROCESSING || 0,
      completedReturns: data?.data?.stats?.COMPLETED || 0,
      totalRefunded: data?.data?.stats?.totalRefunded || 0,
  }

  const handleDeleteReturn = async () => {
    if (!returnToDelete?._id) return;

    try {
      const result = await deleteReturn(returnToDelete._id).unwrap();
      if (result.success) {
        toast.success("Return deleted successfully");
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete return");
    } finally {
      setReturnToDelete(null);
      setOpenDeleteAlert(false);
    }
  };

  const handleStatusChange = async (
    returnId: string,
    returnStatus?: string,
    refundStatus?: string,
  ) => {
    try {
      const result = await updateReturnStatus({
        id: returnId,
        data: {
          ...(returnStatus && { returnStatus }),
          ...(refundStatus && { refundStatus }),
        },
      }).unwrap();

      if (result.success) {
        toast.success("Status updated successfully");
        refetch();
        setOpenStatusModal(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleReset = () => {
    setFilters({
      searchTerm: "",
      returnStatus: "",
      refundStatus: "",
    });
    setDateFilter({ from: undefined, to: undefined });
    setDateType("created");
    setPage(1);
  };

  if (isLoading) {
    return <DashboardManagementPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            Failed to load returns
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardPageHeader
        title="Return Parcel Management"
        subTitle="Manage customer returned parcels, restocks, and refund workflows"
        actionLabel="Create Return"
        onAction={() => setOpenCreateModal(true)}
      />

      {/* Stats Cards */}
      <ReturnStatsCards stats={stats} />

      {/* Filters */}
      <ReturnFilters
        filters={filters}
        dateFilter={dateFilter}
        dateType={dateType}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onDateChange={(date) => {
          setDateFilter(date);
          setPage(1);
        }}
        onDateTypeChange={(t) => {
          setDateType(t);
          setPage(1);
        }}
        onReset={handleReset}
        totalResults={data?.meta?.total}
      />

      {/* Table */}
      <ReturnTable
        returns={data?.data?.data || []}
        isLoading={isLoading}
        onView={(returnItem) => {
          setSelectedReturn(returnItem);
          setOpenViewModal(true);
        }}
        onStatusChange={(returnItem) => {
          setStatusModalData({
            id: returnItem._id,
            returnStatus: returnItem.returnStatus,
            refundStatus: returnItem.refundStatus,
          });
          setOpenStatusModal(true);
        }}
        onDelete={(returnItem) => {
          setReturnToDelete(returnItem);
          setOpenDeleteAlert(true);
        }}
      />

      {/* Pagination */}
      {data?.meta && (
        <TablePagination
          currentPage={page}
          totalPages={data.meta.totalPage}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      <CreateReturnModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
        products={productsData?.data || []}
        onSuccess={() => {
          refetch();
          setOpenCreateModal(false);
        }}
      />

      <ReturnDetailsModal
        open={openViewModal}
        returnItem={selectedReturn}
        onOpenChange={setOpenViewModal}
      />

      <UpdateReturnStatusModal
        open={openStatusModal}
        data={statusModalData}
        onOpenChange={setOpenStatusModal}
        onConfirm={(returnStatus, refundStatus) => {
          if (statusModalData?.id) {
            handleStatusChange(statusModalData.id, returnStatus, refundStatus);
          }
        }}
      />

      <DeleteAlert
        open={openDeleteAlert}
        onOpenChange={setOpenDeleteAlert}
        description="Are you sure you want to delete this return parcel? This action cannot be undone."
        onConfirm={handleDeleteReturn}
        actionType={"delete"}
      />
    </div>
  );
};

export default ReturnsManagement;