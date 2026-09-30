"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetMySchedulesQuery } from "@/redux/features/schedule/schedule.api";
import ScheduleDayModal from "./ScheduleDayModal";
import { getTodayKey, toDateKey, toMonthKey } from "@/utils/schedule-utils";
import { ISchedule } from "@/types/schedule.types";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ScheduleCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayKey = getTodayKey();

  const { data } = useGetMySchedulesQuery({ month: toMonthKey(year, month) });

  const schedulesByDate = useMemo(() => {
    const map: Record<string, ISchedule[]> = {};
    (data?.data || []).forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [data]);

  const upcomingCount = useMemo(
    () => (data?.data || []).filter((item) => item.date >= todayKey).length,
    [data, todayKey],
  );

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (step: number) => {
    const next = new Date(year, month + step, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(toDateKey(year, month, day));
    setPopoverOpen(false);
    setModalOpen(true);
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <CalendarDays className="h-5 w-5" />
            {upcomingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-600 px-1 text-[10px] font-medium text-white">
                {upcomingCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80 overflow-hidden p-0">
          <div className="flex items-center justify-between bg-yellow-600 px-4 py-3 text-white">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded p-1 hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold">{monthLabel}</p>
              <p className="text-xs opacity-80">
                {upcomingCount} upcoming schedule{upcomingCount !== 1 && "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded p-1 hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
              {WEEK_DAYS.map((d, i) => (
                <div key={i} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;

                const key = toDateKey(year, month, day);
                const hasSchedule = !!schedulesByDate[key]?.length;
                const isToday = key === todayKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-sm transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-950",
                      isToday &&
                        "bg-yellow-100 font-semibold text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300",
                      hasSchedule &&
                        "font-semibold ring-2 ring-green-500/70 dark:ring-green-400/70",
                    )}
                  >
                    {/* Pulsing round animation */}
                    {hasSchedule && (
                      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-green-400/40" />
                    )}

                    <span className="relative">{day}</span>

                    {hasSchedule && (
                      <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <ScheduleDayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDate}
        schedules={selectedDate ? schedulesByDate[selectedDate] || [] : []}
      />
    </>
  );
}