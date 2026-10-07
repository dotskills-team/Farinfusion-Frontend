"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSetFbAvailabilityMutation } from "@/redux/features/facebook/facebook.api";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import { getErrorMessage } from "@/utils/inbox.utils";


// Moderator-only. New chats are auto-assigned only to ONLINE moderators.
// Going offline moves this moderator's open chats to others (or the pool).
export default function AvailabilityToggle() {
  const { data: me } = useGetMeQuery();
  const [setAvailability, { isLoading }] = useSetFbAvailabilityMutation();

  const online = me?.data?.chatStatus === "ONLINE";

  const handleChange = async (checked: boolean) => {
    try {
      await setAvailability({
        chatStatus: checked ? "ONLINE" : "OFFLINE",
      }).unwrap();

      toast.success(
        checked
          ? "You are online. New chats can be assigned to you."
          : "You are offline. Your open chats were moved to other moderators or the pool.",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "h-2.5 w-2.5 shrink-0 rounded-full",
            online ? "bg-emerald-500" : "bg-slate-400",
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-none">
            {online ? "Online" : "Offline"}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {online ? "You can receive new chats" : "You won't receive new chats"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={online}
          onCheckedChange={handleChange}
          disabled={isLoading || !me}
          aria-label="Toggle chat availability"
        />
      </div>
    </div>
  );
}