"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import DashboardSkeleton from "./DashboardSkeleton";
import CalculatorWidget from "../calculator/CalculatorWidget";
import ScheduleCalendar from "../schedule/ScheduleCalender";

export const DashboardContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoading } = useUserInfoQuery(undefined);
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const autoClosedRef = useRef(false);

  useEffect(() => {
    if (pathname === "/staff/dashboard/pos") {
      if (!autoClosedRef.current) {
        setOpen(false);
        autoClosedRef.current = true;
      }
    } else {
      autoClosedRef.current = false;
    }
  }, [pathname, setOpen]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between sticky top-0 bg-background z-10">
          <SidebarTrigger className="-ml-1" />

          <div className="flex items-center gap-2">
            <ScheduleCalendar />
            <CalculatorWidget />
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </>
  );
};