"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDeleteScheduleMutation } from "@/redux/features/schedule/schedule.api";
import ScheduleForm from "./ScheduleForm";
import { ISchedule } from "@/types/schedule.types";
import { formatDateLabel, formatTime12 } from "@/utils/schedule-utils";

interface ScheduleDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  schedules: ISchedule[];
}

export default function ScheduleDayModal({
  open,
  onOpenChange,
  date,
  schedules,
}: ScheduleDayModalProps) {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<ISchedule | null>(null);
  const [deleteSchedule, { isLoading: isDeleting }] =
    useDeleteScheduleMutation();

  const backToList = () => {
    setMode("list");
    setEditing(null);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) backToList();
    onOpenChange(value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await deleteSchedule(id).unwrap();
      toast.success("Schedule deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete schedule");
    }
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{formatDateLabel(date)}</DialogTitle>
          <DialogDescription>
            {mode === "form"
              ? editing
                ? "Edit schedule"
                : "Add new schedule"
              : schedules.length > 0
                ? `${schedules.length} schedule${schedules.length > 1 ? "s" : ""}`
                : "No schedule"}
          </DialogDescription>
        </DialogHeader>

        {mode === "form" ? (
          <ScheduleForm
            date={date}
            schedule={editing}
            onSuccess={backToList}
            onCancel={backToList}
          />
        ) : (
          <div className="space-y-3">
            {schedules.length === 0 ? (
              <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No schedule for this date
              </p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {schedules.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-lg border p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <p className="flex items-center gap-1 text-xs font-medium text-primary">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime12(item.time)}
                        </p>
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditing(item);
                            setMode("form");
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          disabled={isDeleting}
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => {
                setEditing(null);
                setMode("form");
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}