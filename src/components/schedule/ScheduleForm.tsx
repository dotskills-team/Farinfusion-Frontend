/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from "@/redux/features/schedule/schedule.api";
import { ISchedule } from "@/types/schedule.types";

const scheduleFormSchema = z.object({
  time: z.string().min(1, "Time is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().max(500, "Description is too long").optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  date: string; // calendar theke auto
  schedule?: ISchedule | null; // edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

const inputCls =
  "h-9 rounded-lg border-gray-200 bg-gray-50/60 text-sm transition-colors placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800/60 dark:placeholder:text-gray-600 dark:focus:border-indigo-500 dark:focus:bg-gray-800";

export default function ScheduleForm({
  date,
  schedule,
  onSuccess,
  onCancel,
}: ScheduleFormProps) {
  const [createSchedule, { isLoading: isCreating }] =
    useCreateScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateScheduleMutation();

  const isEdit = !!schedule;
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      time: schedule?.time || "",
      title: schedule?.title || "",
      description: schedule?.description || "",
    },
  });

  useEffect(() => {
    reset({
      time: schedule?.time || "",
      title: schedule?.title || "",
      description: schedule?.description || "",
    });
  }, [schedule, reset]);

  const handleFormSubmit = async (values: ScheduleFormValues) => {
    try {
      if (isEdit && schedule) {
        await updateSchedule({
          id: schedule._id,
          data: { ...values, date },
        }).unwrap();
        toast.success("Schedule updated successfully");
      } else {
        await createSchedule({ ...values, date }).unwrap();
        toast.success("Schedule added successfully");
      }
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save schedule");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Time */}
      <div>
        <label className="block text-sm font-medium mb-2">Time *</label>
        <Input type="time" {...register("time")} className={cn(inputCls)} />
        {errors.time && (
          <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          {...register("title")}
          placeholder="Schedule title"
          className={cn(inputCls)}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Short Description
        </label>
        <Textarea
          {...register("description")}
          placeholder="Short description (optional)"
          rows={3}
          className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Schedule" : "Add Schedule"}
        </Button>
      </div>
    </form>
  );
}