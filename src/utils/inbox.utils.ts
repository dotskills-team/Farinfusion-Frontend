/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  IFbConversation,
  IFbUserRef,
  TFbConvStatus,
} from "@/types/facebook.types";

export type FbTab = "mine" | "unassigned" | "all";

export const MANAGEMENT_ROLES = ["ADMIN", "MANAGER"];

// assignedTo is a populated object in the list, but a plain id elsewhere
export const getAssignee = (
  c: Pick<IFbConversation, "assignedTo">,
): IFbUserRef | null =>
  c.assignedTo && typeof c.assignedTo === "object" ? c.assignedTo : null;

export const getAssigneeId = (
  c: Pick<IFbConversation, "assignedTo">,
): string | null => {
  if (!c.assignedTo) return null;
  return typeof c.assignedTo === "string" ? c.assignedTo : c.assignedTo._id;
};

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "F";

export const timeAgo = (iso: string) => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const STATUS_STYLES: Record<
  TFbConvStatus,
  { label: string; className: string }
> = {
  UNASSIGNED: {
    label: "Unassigned",
    className:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  OPEN: {
    label: "Open",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  CONVERTED: {
    label: "Converted",
    className:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  CLOSED: {
    label: "Closed",
    className:
      "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  },
};

export const getErrorMessage = (err: unknown) => {
  const e = err as any;
  return e?.data?.message || e?.message || "Something went wrong";
};