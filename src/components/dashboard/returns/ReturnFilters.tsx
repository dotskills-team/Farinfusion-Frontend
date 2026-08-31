// "use client";

// import React from "react";
// import { Search, RotateCcw } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";

// interface ReturnFiltersState {
//   searchTerm: string;
//   returnStatus: string;
//   refundStatus: string;
//   dateFrom: string;
//   dateTo: string;
// }

// interface ReturnFiltersProps {
//   filters: ReturnFiltersState;
//   onFiltersChange: (filters: ReturnFiltersState) => void;
//   onReset: () => void;
// }

// export const ReturnFilters: React.FC<ReturnFiltersProps> = ({
//   filters,
//   onFiltersChange,
//   onReset,
// }) => {
//   const handleSearchChange = (value: string) => {
//     onFiltersChange({ ...filters, searchTerm: value });
//   };

//   const handleReturnStatusChange = (value: string) => {
//     onFiltersChange({ ...filters, returnStatus: value });
//   };

//   const handleRefundStatusChange = (value: string) => {
//     onFiltersChange({ ...filters, refundStatus: value });
//   };

//   return (
//     <div className="space-y-4 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-slate-900/50">
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
//         {/* Search */}
//         <div className="flex-1">
//           <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Search
//           </label>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <Input
//               placeholder="Search by customer name, phone, order ID, return ID..."
//               value={filters.searchTerm}
//               onChange={(e) => handleSearchChange(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </div>

//         {/* Return Status Filter */}
//         <div className="w-full lg:w-48">
//           <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Return Status
//           </label>
//           <Select
//             value={filters.returnStatus || "all"}
//             onValueChange={(value) =>
//               handleReturnStatusChange(value === "all" ? "" : value)
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="All Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="PENDING">Pending</SelectItem>
//               <SelectItem value="PROCESSING">Processing</SelectItem>
//               <SelectItem value="COMPLETED">Completed</SelectItem>
//               <SelectItem value="CANCELLED">Cancelled</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Refund Status Filter */}
//         <div className="w-full lg:w-48">
//           <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//             Refund Status
//           </label>
//           <Select
//             value={filters.refundStatus || "all"}
//             onValueChange={(value) =>
//               handleRefundStatusChange(value === "all" ? "" : value)
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="All Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="PENDING">Pending</SelectItem>
//               <SelectItem value="PROCESSED">Processed</SelectItem>
//               <SelectItem value="REFUNDED">Refunded</SelectItem>
//               <SelectItem value="NOT_REQUIRED">Not Required</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Reset Button */}
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={onReset}
//           className="gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
//         >
//           <RotateCcw className="h-4 w-4" />
//           Reset
//         </Button>
//       </div>
//     </div>
//   );
// };


"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  RotateCcw,
  X,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export interface DateFilter {
  from: Date | undefined;
  to: Date | undefined;
}

export type ReturnDateType = "created" | "updated" | "pickup";

interface ReturnFiltersState {
  searchTerm: string;
  returnStatus: string;
  refundStatus: string;
}

interface ReturnFiltersProps {
  filters: ReturnFiltersState;
  dateFilter: DateFilter;
  dateType: ReturnDateType;
  onFiltersChange: (filters: ReturnFiltersState) => void;
  onDateChange: (date: DateFilter) => void;
  onDateTypeChange: (type: ReturnDateType) => void;
  onReset: () => void;
  totalResults?: number;
}

const DATE_TYPES: { value: ReturnDateType; label: string; dot: string }[] = [
  { value: "created", label: "Return Date", dot: "bg-slate-400" },
  { value: "updated", label: "Updated At", dot: "bg-blue-500" },
  { value: "pickup", label: "Pickup Date", dot: "bg-cyan-500" },
];

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

function formatDateRange(from: Date | undefined, to: Date | undefined): string {
  if (!from) return "Pick a date";
  const fromStr = format(from, "MMM d, yyyy HH:mm");
  if (!to || isSameDay(from, to)) return fromStr;
  return `${format(from, "MMM d HH:mm")} – ${format(to, "MMM d, yyyy HH:mm")}`;
}

function getActivePresetLabel(
  from: Date | undefined,
  to: Date | undefined,
): string | null {
  if (!from || !to) return null;
  for (const preset of PRESETS) {
    const p = preset.get();
    if (isSameDay(p.from, from) && isSameDay(p.to, to)) return preset.label;
  }
  return null;
}

function applyTime(date: Date, h: number, m: number, s: number): Date {
  return setSeconds(setMinutes(setHours(date, h), m), s);
}

function parseTimeString(t: string): { h: number; m: number } {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return { h, m };
}

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  accentClass: string;
}

function TimeInput({ label, value, onChange, accentClass }: TimeInputProps) {
  return (
    <div className="flex-1 space-y-1">
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          accentClass,
        )}
      >
        {label}
      </p>
      <div className="relative">
        <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-9 w-full rounded-lg border bg-white pl-7 pr-2 text-sm font-mono",
            "text-gray-900 dark:text-gray-50",
            "border-gray-200 dark:border-gray-700 dark:bg-gray-800/60",
            "focus:outline-none focus:ring-1 focus:ring-amber-400 dark:focus:ring-amber-500",
            "transition-colors",
          )}
        />
      </div>
    </div>
  );
}

export const ReturnFilters: React.FC<ReturnFiltersProps> = ({
  filters,
  dateFilter,
  dateType,
  onFiltersChange,
  onDateChange,
  onDateTypeChange,
  onReset,
  totalResults,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
    dateFilter.from ? { from: dateFilter.from, to: dateFilter.to } : undefined,
  );
  const [fromTime, setFromTime] = useState<string>(
    dateFilter.from ? format(dateFilter.from, "HH:mm") : "00:00",
  );
  const [toTime, setToTime] = useState<string>(
    dateFilter.to ? format(dateFilter.to, "HH:mm") : "23:59",
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(filters.searchTerm);
  }, [filters.searchTerm]);

  useEffect(() => {
    setCalendarRange(
      dateFilter.from
        ? { from: dateFilter.from, to: dateFilter.to }
        : undefined,
    );
    if (dateFilter.from) setFromTime(format(dateFilter.from, "HH:mm"));
    if (dateFilter.to) setToTime(format(dateFilter.to, "HH:mm"));
  }, [dateFilter]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => onFiltersChange({ ...filters, searchTerm: val }),
      400,
    );
  };

  const clearSearch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocalSearch("");
    onFiltersChange({ ...filters, searchTerm: "" });
  };

  const handleReturnStatusChange = (value: string) => {
    onFiltersChange({ ...filters, returnStatus: value === "all" ? "" : value });
  };

  const handleRefundStatusChange = (value: string) => {
    onFiltersChange({ ...filters, refundStatus: value === "all" ? "" : value });
  };

  const emitDate = (
    range: DateRange | undefined,
    fTime: string,
    tTime: string,
  ) => {
    if (!range?.from) {
      onDateChange({ from: undefined, to: undefined });
      return;
    }
    const { h: fh, m: fm } = parseTimeString(fTime);
    const { h: th, m: tm } = parseTimeString(tTime);

    const from = applyTime(range.from, fh, fm, 0);
    const to = range.to
      ? applyTime(range.to, th, tm, 59)
      : applyTime(range.from, th, tm, 59);
    onDateChange({ from, to });
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const { from, to } = preset.get();
    const newRange = { from, to };
    setCalendarRange(newRange);
    setFromTime("00:00");
    setToTime("23:59");
    emitDate(newRange, "00:00", "23:59");
    setCalendarOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setCalendarRange(range);
    if (range?.from) {
      emitDate(range, fromTime, toTime);
    } else {
      onDateChange({ from: undefined, to: undefined });
    }
  };

  const handleFromTimeChange = (val: string) => {
    setFromTime(val);
    emitDate(calendarRange, val, toTime);
  };

  const handleToTimeChange = (val: string) => {
    setToTime(val);
    emitDate(calendarRange, fromTime, val);
  };

  const clearDate = () => {
    setCalendarRange(undefined);
    setFromTime("00:00");
    setToTime("23:59");
    onDateChange({ from: undefined, to: undefined });
  };

  const activeDateType = DATE_TYPES.find((d) => d.value === dateType);
  const activeDateLabel = getActivePresetLabel(dateFilter.from, dateFilter.to);
  const dateDisplayLabel = dateFilter.from
    ? formatDateRange(dateFilter.from, dateFilter.to)
    : null;

  const hasActiveFilters =
    !!filters.returnStatus ||
    !!filters.refundStatus ||
    !!filters.searchTerm ||
    !!dateFilter.from;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-slate-900/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-52">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by customer name, phone, order ID, return ID..."
              value={localSearch}
              onChange={handleSearchInput}
              className="pl-10 pr-9"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Return Status Filter */}
        <div className="w-full lg:w-48">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Return Status
          </label>
          <Select
            value={filters.returnStatus || "all"}
            onValueChange={handleReturnStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refund Status Filter */}
        <div className="w-full lg:w-48">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Refund Status
          </label>
          <Select
            value={filters.refundStatus || "all"}
            onValueChange={handleRefundStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSED">Processed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="NOT_REQUIRED">Not Required</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date type + Date-time picker (grouped pill) */}
        <div className="flex shrink-0 items-center gap-0 rounded-lg border border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-800/60 overflow-hidden h-10">
          <Select
            value={dateType}
            onValueChange={(v) => onDateTypeChange(v as ReturnDateType)}
          >
            <SelectTrigger className="h-10 gap-1.5 border-0 border-r border-gray-200 dark:border-gray-700 bg-transparent rounded-none w-36 text-xs font-semibold text-gray-600 dark:text-gray-400 focus:ring-0 shadow-none">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    activeDateType?.dot ?? "bg-slate-400",
                  )}
                />
                <span className="truncate">
                  {activeDateType?.label ?? "Date type"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {DATE_TYPES.map((dt) => (
                <SelectItem
                  key={dt.value}
                  value={dt.value}
                  className="cursor-pointer text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", dt.dot)} />
                    {dt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex h-10 items-center gap-2 px-3 text-sm font-medium transition-colors duration-150 focus:outline-none",
                  dateFilter.from
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                )}
              >
                {dateFilter.from ? (
                  <CalendarRange className="h-4 w-4 shrink-0" />
                ) : (
                  <CalendarDays className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate max-w-40">
                  {dateDisplayLabel ?? "Pick date & time"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                    calendarOpen && "rotate-180",
                  )}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              className="w-auto p-0 rounded-2xl border-gray-200/80 dark:border-gray-700/60 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="border-b border-gray-100 dark:border-gray-800 sm:border-b-0 sm:border-r sm:w-36 p-3 space-y-0.5">
                  <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Quick select
                  </p>
                  {PRESETS.map((preset) => {
                    const p = preset.get();
                    const isActive =
                      dateFilter.from &&
                      dateFilter.to &&
                      isSameDay(p.from, dateFilter.from) &&
                      isSameDay(p.to, dateFilter.to);
                    return (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                          isActive
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800",
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  {dateFilter.from && (
                    <>
                      <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={() => {
                          clearDate();
                          setCalendarOpen(false);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Custom range
                  </p>

                  <Calendar
                    mode="range"
                    selected={calendarRange}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                    initialFocus
                    className="rounded-xl"
                    classNames={{
                      day_selected:
                        "bg-amber-500 text-white hover:bg-amber-500 focus:bg-amber-500 dark:bg-amber-600",
                      day_range_middle:
                        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                      day_range_start:
                        "bg-amber-500 text-white rounded-l-full dark:bg-amber-600",
                      day_range_end:
                        "bg-amber-500 text-white rounded-r-full dark:bg-amber-600",
                      day_today:
                        "border border-amber-400 text-amber-700 font-bold dark:border-amber-500 dark:text-amber-400",
                    }}
                  />

                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Time Range
                      </span>
                    </div>

                    <div className="flex items-end gap-2">
                      <TimeInput
                        label="From"
                        value={fromTime}
                        onChange={handleFromTimeChange}
                        accentClass="text-amber-600 dark:text-amber-400"
                      />
                      <div className="flex h-9 items-center pb-0.5">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <TimeInput
                        label="To"
                        value={toTime}
                        onChange={handleToTimeChange}
                        accentClass="text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    {calendarRange?.from &&
                      (() => {
                        const { h: fh, m: fm } = parseTimeString(fromTime);
                        const { h: th, m: tm } = parseTimeString(toTime);
                        const fromDt = applyTime(calendarRange.from, fh, fm, 0);
                        const toDt = calendarRange.to
                          ? applyTime(calendarRange.to, th, tm, 59)
                          : applyTime(calendarRange.from, th, tm, 59);
                        return (
                          <div className="mt-2 rounded-lg border border-amber-200/60 bg-amber-50/40 px-2.5 py-1.5 dark:border-amber-900/30 dark:bg-amber-900/10">
                            <p className="text-[11px] font-mono text-amber-800 dark:text-amber-300 leading-relaxed">
                              {format(fromDt, "MMM d, yyyy · HH:mm")}{" "}
                              <span className="text-amber-400">→</span>{" "}
                              {format(toDt, "MMM d, yyyy · HH:mm")}
                            </p>
                          </div>
                        );
                      })()}

                    {calendarRange?.from && !calendarRange?.to && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 px-0.5">
                        Select an end date to complete the range
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {dateFilter.from && (
            <button
              onClick={clearDate}
              aria-label="Clear date filter"
              className="h-10 px-2.5 text-gray-400 hover:text-red-500 border-l border-gray-200 dark:border-gray-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 h-10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Active filter chips */}
      {(hasActiveFilters || totalResults !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          {totalResults !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
              {hasActiveFilters && " matching filters"}
            </span>
          )}

          {filters.searchTerm && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <Search className="h-3 w-3" />
              &quot;{filters.searchTerm}&quot;
              <button onClick={clearSearch} aria-label="Remove search" className="ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {dateFilter.from && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <Clock className="h-3 w-3" />
              {activeDateType && (
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  {activeDateType.label}:
                </span>
              )}
              {activeDateLabel ?? formatDateRange(dateFilter.from, dateFilter.to)}
              <button onClick={clearDate} aria-label="Remove date filter" className="ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};