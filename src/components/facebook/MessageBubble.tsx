/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import type { IFbMessage } from "@/types/facebook.types";
import { formatTime } from "@/utils/inbox.utils";

export default function MessageBubble({ message }: { message: IFbMessage }) {
  const outbound = message.direction === "outbound";

  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
          outbound
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border bg-background",
        )}
      >
        {message.attachments.map((a, i) =>
          a.url && (!a.type || a.type.startsWith("image")) ? (
            <img
              key={i}
              src={a.url}
              alt={a.name || "attachment"}
              className="mb-1 max-h-60 rounded-lg"
            />
          ) : a.url ? (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="mb-1 block underline"
            >
              {a.name || "Attachment"}
            </a>
          ) : null,
        )}

        {message.text && (
          <p className="whitespace-pre-wrap wrap-break">{message.text}</p>
        )}

        <p
          className={cn(
            "mt-1 text-[10px]",
            outbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {outbound && message.sentByName ? `${message.sentByName} · ` : ""}
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}