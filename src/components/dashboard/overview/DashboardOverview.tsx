/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  RotateCcw,
  X,
  ArrowUpRight,
  Truck,
  User,
  Wallet,
  Banknote,
  BadgeCheck,
  PhoneMissed,
} from "lucide-react";
import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboard.api";
import {
  useGetAllUsersQuery,
  useGetMeQuery,
} from "@/redux/features/user/user.api";
import { cn } from "@/lib/utils";
import { IDashboardOverview } from "@/types/dashboard-overview";
import { StaffPerformanceTable } from "./StaffPerformanceTable";
import { MyPerformanceSection } from "./MyPerformanceSection";
import {
  StatusBreakdownGrid,
  StatusBreakdownItem,
} from "./StatusBreakdownGrid";
import { TopProductsTable } from "./TopProductsTable";
import { ConfirmedProductsTable } from "./ConfirmedProductsTable";
import { RecentOrdersTable } from "./RecentOrdersTable";

const PRESETS = [
  {
    label: "Today",
    get: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: "Yesterday",
    get: () => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    },
  },
  {
    label: "This week",
    get: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This month",
    get: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: "Last 30 days",
    get: () => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { from: startOfDay(d), to: endOfDay(new Date()) };
    },
  },
];

const ORDER_STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending", dot: "bg-amber-500" },
  { value: "CONFIRMED", label: "Confirmed", dot: "bg-emerald-500" },
  { value: "COURIERASSIGNED", label: "Courier Assigned", dot: "bg-blue-500" },
  { value: "NO_RESPONSE", label: "No Response", dot: "bg-rose-500" },
  { value: "COMPLETED", label: "Completed", dot: "bg-violet-500" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-red-500" },
  { value: "IN_TRANSIT", label: "In Transit", dot: "bg-purple-500 " },
];

function formatDateLabel(from?: Date, to?: Date) {
  if (!from) return "Filter by date";
  if (!to || isSameDay(from, to)) return format(from, "MMM d, yyyy");
  return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
}

function getPresetLabel(from?: Date, to?: Date) {
  if (!from || !to) return null;
  for (const p of PRESETS) {
    const r = p.get();
    if (isSameDay(r.from, from) && isSameDay(r.to, to)) return p.label;
  }
  return null;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
  trend?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white px-5 py-4 transition-all duration-200 hover:border-amber-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900 dark:hover:border-amber-900/40">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-amber-50/0 transition-all duration-300 group-hover:bg-amber-50/30 dark:group-hover:bg-amber-900/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums leading-tight text-gray-900 dark:text-gray-50">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {sub}
            </p>
          )}
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  CONFIRMED:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  COURIERASSIGNED:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  NO_RESPONSE:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  COMPLETED:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
  CANCELLED:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  IN_TRANSIT:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800",
        className,
      )}
    />
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white px-3 py-2 shadow-lg dark:border-gray-700/60 dark:bg-gray-900">
      {label && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>
      )}
      {payload.map((p: any) => (
        <p
          key={p.name}
          className="text-sm font-semibold tabular-nums"
          style={{ color: p.color }}
        >
          {p.name === "Revenue" ? `৳${Number(p?.value)}` : p.value}{" "}
          {p.name !== "Revenue" ? p.name : ""}
        </p>
      ))}
    </div>
  );
}

function StaffSalaryView({
  name,
  totalSalary,
}: {
  name: string;
  totalSalary?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
          <BadgeCheck className="h-8 w-8 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Welcome, {name}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your personal salary overview
          </p>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 px-8 py-8 text-center transition-all duration-300 hover:border-amber-300 hover:shadow-lg dark:border-amber-800/60 dark:from-amber-900/20 dark:to-orange-900/10">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-amber-100/0 transition-all duration-300 group-hover:bg-amber-100/20 dark:group-hover:bg-amber-900/10" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-600/70 dark:text-amber-500/70">
                Total Salary
              </p>
            </div>
            <p className="text-5xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              ৳{(totalSalary ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total salary paid to date
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
        <Banknote className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Contact your administrator for salary details or payroll queries.
        </p>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { data: me } = useGetMeQuery(undefined);
  const userRole = me?.data?.role?.toUpperCase() ?? "CUSTOMER";
  const isAdmin = userRole === "ADMIN";
  const isModerator = userRole === "MODERATOR";
  const isManager = userRole === "MANAGER";
  const isStaff = ["MANAGER", "MODERATOR", "TELESALES"].includes(userRole);
  const isGeneralStaff = userRole === "GENERALSTAFF";
  // Roles whose backend payload includes `myPerformance` (individually scoped stats)
  const isMyPerformanceRole = ["MODERATOR", "TELESALES"].includes(userRole);

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [calRange, setCalRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  const queryParams: Record<string, string> = {};

  if (dateFrom) queryParams["updatedAt[gte]"] = dateFrom.toISOString();
  if (dateTo) queryParams["updatedAt[lte]"] = dateTo.toISOString();

  const deliveryStatuses = ["COURIERASSIGNED", "IN_TRANSIT"];

  if (deliveryStatuses.includes(orderStatus)) {
    queryParams.deliveryStatus = orderStatus;
  } else if (orderStatus && orderStatus !== "ALL") {
    queryParams.orderStatus = orderStatus;
  }

  const {
    data: overviewRes,
    isLoading,
    isError,
  } = useGetDashboardOverviewQuery(queryParams);
  const data: IDashboardOverview | undefined = overviewRes?.data;
  const commissionSalary = me?.data?.commissionSalary || 20;
     console.log("Overview Res ", data)
  const { data: users } = useGetAllUsersQuery({});

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const { from, to } = preset.get();
    setCalRange({ from, to });
    setDateFrom(from);
    setDateTo(to);
    setCalOpen(false);
  };

  const handleCalSelect = (range: DateRange | undefined) => {
    setCalRange(range);
    if (range?.from && range?.to) {
      setDateFrom(startOfDay(range.from));
      setDateTo(endOfDay(range.to));
    } else if (range?.from) {
      setDateFrom(startOfDay(range.from));
      setDateTo(endOfDay(range.from));
    } else {
      setDateFrom(undefined);
      setDateTo(undefined);
    }
  };

  const clearDate = () => {
    setCalRange(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setCalOpen(false);
  };
  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setCalRange(undefined);
    setOrderStatus("");
    setCalOpen(false);
  };

  const hasFilters = !!dateFrom || !!orderStatus;
  const activeDateLabel = getPresetLabel(dateFrom, dateTo);
  const dateChipLabel = dateFrom
    ? (activeDateLabel ?? formatDateLabel(dateFrom, dateTo))
    : null;
  const activeStatus = ORDER_STATUS_OPTIONS.find(
    (s) => s.value === orderStatus,
  );

  const orderStatsChartData = data
    ? [
        { name: "Pending", value: data?.orderStats?.PENDING, fill: "#f59e0b" },
        {
          name: "Confirmed",
          value: data?.orderStats?.CONFIRMED,
          fill: "#10b981",
        },
        {
          name: "Completed",
          value: data?.orderStats?.COMPLETED,
          fill: "#8f71d3",
        },
        {
          name: "Courier Assigned",
          value: data?.orderStats?.COURIER_ASSIGNED || 0,
          fill: "#3b82f6",
        },
        {
          name: "No Response",
          value: data?.orderStats?.NO_RESPONSE || 0,
          fill: "#e11d48",
        },
        {
          name: "Cancelled",
          value: data?.orderStats?.CANCELLED,
          fill: "#ef4444",
        },
        {
          name: "In Transit",
          value: data?.orderStats?.IN_TRANSIT,
          fill: "#580f9c",
        },
      ]
    : [];

  // Org-wide status breakdown (Admin / Manager) — built via the shared StatusBreakdownGrid config
  const orderStatusItems: StatusBreakdownItem[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "PENDING",
        label: "Pending",
        icon: Clock,
        cls: "border-amber-200 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-900/10",
        val: "text-amber-700 dark:text-amber-400",
        count: data.orderStats?.PENDING ?? 0,
      },
      {
        key: "CONFIRMED",
        label: "Confirmed",
        icon: CheckCircle2,
        cls: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-900/10",
        val: "text-emerald-700 dark:text-emerald-400",
        count: data.orderStats?.CONFIRMED ?? 0,
      },
      {
        key: "COMPLETED",
        label: "Completed",
        icon: CheckCircle2,
        cls: "border-violet-200 bg-violet-50/60 dark:border-violet-900/30 dark:bg-violet-900/10",
        val: "text-violet-700 dark:text-violet-400",
        count: data.orderStats?.COMPLETED ?? 0,
      },
      {
        key: "COURIERASSIGNED",
        label: "Courier Assigned",
        icon: Truck,
        cls: "border-blue-200 bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-900/10",
        val: "text-blue-700 dark:text-blue-400",
        count: data.orderStats?.COURIER_ASSIGNED ?? 0,
      },
      {
        key: "NO_RESPONSE",
        label: "No Response",
        icon: PhoneMissed,
        cls: "border-rose-200 bg-rose-50/60 dark:border-rose-900/30 dark:bg-rose-900/10",
        val: "text-rose-700 dark:text-rose-400",
        count: data.orderStats?.NO_RESPONSE ?? 0,
      },
      {
        key: "CANCELLED",
        label: "Cancelled",
        icon: XCircle,
        cls: "border-red-200 bg-red-50/60 dark:border-red-900/30 dark:bg-red-900/10",
        val: "text-red-700 dark:text-red-400",
        count: data.orderStats?.CANCELLED ?? 0,
      },
      {
        key: "IN_TRANSIT",
        label: "In Transit",
        icon: XCircle,
        cls: "border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-900/10",
        val: "text-purple-700 dark:text-purple-400",
        count: data.orderStats?.IN_TRANSIT ?? 0,
      },
    ];
  }, [data]);

  const staffBarData = useMemo(() => {
    if (!(isAdmin || isManager) || !data?.staffPerformance?.length) return [];
    return [...data.staffPerformance]
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
      .slice(0, 8)
      .map((s) => ({
        name: s.sellerName?.split(" ")[0] ?? "Staff",
        Revenue: s.revenue ?? 0,
        Orders: s.totalOrders ?? 0,
      }));
  }, [data, isAdmin, isManager]);

  const roleLabel = isAdmin
    ? "Admin Overview"
    : isStaff
      ? "Staff Dashboard"
      : isGeneralStaff
        ? "My Salary"
        : "My Overview";

  if (isGeneralStaff) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
              My Salary
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your salary summary
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="h-64 w-full max-w-sm" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Failed to load salary data.
            </p>
          </div>
        ) : (
          <StaffSalaryView
            name={me?.data?.name ?? "Staff"}
            totalSalary={(data as any)?.mySalary}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
              {roleLabel}
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {isAdmin
              ? "Real-time overview of orders, revenue, staff performance and product metrics"
              : isStaff
                ? "Your assigned orders, revenue, and delivery tracking"
                : "Your order history and spending summary"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-lg text-gray-800 font-semibold">Welcome</span>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 dark:border-amber-900/40 dark:bg-amber-900/20">
            <User className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {me?.data?.name ?? "Welcome"}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-900 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            value={orderStatus || "ALL"}
            onValueChange={(v) => setOrderStatus(v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 bg-gray-50/60 text-sm focus:border-amber-400 dark:border-gray-700 dark:bg-gray-800/60 dark:focus:border-amber-500 transition-colors">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ORDER_STATUS_OPTIONS.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="cursor-pointer text-sm"
                >
                  <div className="flex items-center gap-2">
                    {s.dot && (
                      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                    )}
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all duration-200",
                  dateFrom
                    ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-gray-200 bg-gray-50/60 text-gray-600 hover:border-amber-200 hover:bg-amber-50/40 hover:text-amber-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-amber-800 dark:hover:text-amber-400",
                )}
              >
                {dateFrom ? (
                  <CalendarRange className="h-4 w-4 shrink-0" />
                ) : (
                  <CalendarDays className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate max-w-35">
                  {dateFrom
                    ? formatDateLabel(dateFrom, dateTo)
                    : "Filter by date"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                    calOpen && "rotate-180",
                  )}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto p-0 rounded-2xl border-amber-200/60 dark:border-amber-900/40 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="border-b border-amber-100 dark:border-amber-900/30 sm:border-b-0 sm:border-r sm:w-36 p-3 space-y-0.5">
                  <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-500/60">
                    Quick select
                  </p>
                  {PRESETS.map((preset) => {
                    const r = preset.get();
                    const isActive =
                      dateFrom &&
                      dateTo &&
                      isSameDay(r.from, dateFrom) &&
                      isSameDay(r.to, dateTo);
                    return (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                          isActive
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "text-gray-600 hover:bg-amber-50 hover:text-amber-700 dark:text-gray-400 dark:hover:bg-amber-900/10 dark:hover:text-amber-400",
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  {dateFrom && (
                    <>
                      <div className="my-1.5 border-t border-amber-100 dark:border-amber-900/30" />
                      <button
                        onClick={clearDate}
                        className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Clear date
                      </button>
                    </>
                  )}
                </div>
                <div className="p-3">
                  <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-500/60">
                    Custom range
                  </p>
                  <Calendar
                    mode="range"
                    selected={calRange}
                    onSelect={handleCalSelect}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                    initialFocus
                    classNames={{
                      day_selected:
                        "bg-amber-500 text-white hover:bg-amber-500 dark:bg-amber-600",
                      day_range_middle:
                        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                      day_range_start:
                        "bg-amber-500 text-white rounded-l-full dark:bg-amber-600",
                      day_range_end:
                        "bg-amber-500 text-white rounded-r-full dark:bg-amber-600",
                      day_today:
                        "border border-amber-400 text-amber-700 font-bold dark:border-amber-600 dark:text-amber-400",
                    }}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="group h-10 gap-1.5 rounded-xl border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              Reset
            </Button>
          )}
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {dateChipLabel && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
              >
                <CalendarDays className="h-3 w-3" />
                {dateChipLabel}
                <button
                  onClick={clearDate}
                  className="ml-0.5 hover:text-amber-900 dark:hover:text-amber-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeStatus?.value && activeStatus.value !== "ALL" && (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_BADGE[activeStatus.value] ?? "",
                )}
              >
                {activeStatus.dot && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      (activeStatus as any).dot,
                    )}
                  />
                )}
                {activeStatus.label}
                <button onClick={() => setOrderStatus("")} className="ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(isAdmin ? 4 : 2)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Failed to load dashboard data.
          </p>
        </div>
      ) : data ? (
        <>
          {/* ── Individually-scoped performance for Moderator / TELESALES ── */}
          {isMyPerformanceRole && data.myPerformance ? (
            <MyPerformanceSection
              performance={data.myPerformance}
              dateLabel={dateChipLabel}
              commissionRate={isModerator ? commissionSalary : undefined}
            />
          ) : (
            <>
              {/* KPI cards */}
              <div
                className={cn(
                  "grid gap-4",
                  isAdmin
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3",
                )}
              >
                {isAdmin && (
                  <>
                    <StatCard
                      label="Total Orders"
                      value={data.totalOrders}
                      icon={ShoppingBag}
                      accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    />
                    <StatCard
                      label="Courier Assigned"
                      value={data.orderStats?.COURIER_ASSIGNED || 0}
                      icon={Truck}
                      accent="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      sub="waiting pickup"
                    />
                    <StatCard
                      label="No Response"
                      value={data.orderStats?.NO_RESPONSE || 0}
                      icon={PhoneMissed}
                      accent="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                      sub="customer unreachable"
                    />
                    <StatCard
                      label="Total Revenue"
                      value={`৳${data.totalRevenue}`}
                      icon={TrendingUp}
                      accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      sub="All confirmed payments"
                    />
                  </>
                )}
                {isAdmin && data.totalUsers !== undefined && (
                  <StatCard
                    label="Total Staffs"
                    value={data.totalUsers}
                    icon={Users}
                    accent="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  />
                )}
                {isAdmin && (
                  <>
                    <StatCard
                      label="Total Buying Price"
                      value={`৳${(data as any).totalCost ?? 0}`}
                      icon={Package}
                      accent="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      sub="Total buying cost"
                    />
                    <StatCard
                      label="Staff Salary"
                      value={`৳${users?.meta?.totalSalary ?? 0}`}
                      icon={Users}
                      accent="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      sub="Total salary paid"
                    />
                    <StatCard
                      label="Net Profit"
                      value={`৳${(data as any).netProfit.toFixed(0) ?? 0}`}
                      icon={TrendingUp}
                      accent={
                        ((data as any).netProfit ?? 0) >= 0
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }
                      sub={
                        ((data as any).netProfit ?? 0) >= 0 ? "Profit" : "Loss"
                      }
                    />
                  </>
                )}
                {isAdmin && data.totalProducts !== undefined && (
                  <StatCard
                    label="Products"
                    value={data.totalProducts}
                    icon={Package}
                    accent="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
                  />
                )}
              </div>

              {/* Org-wide order status breakdown */}
              <StatusBreakdownGrid
                items={orderStatusItems}
                total={data.totalOrders}
              />
            </>
          )}

          {/* Charts — hidden for the individually-scoped staff view, which has its own breakdown */}
          {!isMyPerformanceRole && (
            <div
              className={cn(
                "grid gap-6",
                isAdmin || isManager
                  ? "grid-cols-1 xl:grid-cols-5"
                  : "grid-cols-1 lg:grid-cols-2",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900",
                  isAdmin || isManager ? "xl:col-span-2" : "",
                )}
              >
                <p className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-50">
                  Order Distribution
                </p>
                <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                  Breakdown by status
                </p>
                {data.totalOrders === 0 ? (
                  <div className="flex h-48 items-center justify-center">
                    <p className="text-xs text-gray-400">
                      No orders in this period
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={orderStatsChartData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {orderStatsChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "18px",
                        }}
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => (
                          <span className="text-xs text-gray-600 dark:text-gray-400 ">
                            {v}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {(isAdmin || isManager) && staffBarData.length > 0 ? (
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900 xl:col-span-3">
                  <p className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-50">
                    Staff Performance
                  </p>
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                    Top {staffBarData.length} staff by revenue
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={staffBarData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="Revenue"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900">
                  <p className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-50">
                    Order Status
                  </p>
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                    Count by status
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={orderStatsChartData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      >
                        {orderStatsChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── Staff Performance Table — ADMIN + MANAGER analytics, date-filtered ── */}
          {(isAdmin || isManager) && (
            <StaffPerformanceTable
              staffPerformance={data.staffPerformance ?? []}
              dateLabel={dateChipLabel}
            />
          )}

          {/* ── Staff Earnings Table — ADMIN only, payroll (commission-based), date-filtered ── */}
          {/* {isAdmin && data.staffEarnings && (
            <StaffEarningsTable
              staffEarnings={(data as any).staffEarnings ?? []}
              dateLabel={dateChipLabel}
            />
          )} */}

          {/* ── Top Products Table — ADMIN + MANAGER, date-filtered ── */}
          {(isAdmin || isManager) && (
            <TopProductsTable
              topProducts={(data as any).topProducts ?? []}
              dateLabel={dateChipLabel}
            />
          )}

          {/* ── Confirmed Orders Table — ADMIN + MANAGER, date-filtered ── */}
          {(isAdmin || isManager) && (
            <ConfirmedProductsTable
              confirmedProducts={(data as any).confirmedProducts ?? []}
              dateLabel={dateChipLabel}
            />
          )}

          {/* Recent Orders */}
          {data.recentOrders && data.recentOrders.length > 0 && (
            <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    Recent Orders
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Last 5 orders matching your filters
                  </p>
                </div>
                <Truck className="h-4 w-4 text-amber-500" />
              </div>
              <div className="divide-y divide-gray-100/80 dark:divide-gray-800/60">
                <RecentOrdersTable orders={data.recentOrders} />
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
