
"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IFbMessage, TFbReaction } from "@/types/facebook.types";
import { formatTime } from "@/utils/inbox.utils";

const REACTIONS: { value: TFbReaction; emoji: string }[] = [
  { value: "like", emoji: "👍" },
  { value: "love", emoji: "❤️" },
  { value: "smile", emoji: "😆" },
  { value: "wow", emoji: "😮" },
  { value: "sad", emoji: "😢" },
  { value: "angry", emoji: "😠" },
];

interface Props {
  message: IFbMessage;
  // Only customer messages can be reacted to. Pass nothing to disable
  onReact?: (message: IFbMessage, reaction: TFbReaction | null) => void;
}

export default function MessageBubble({ message, onReact }: Props) {
  const outbound = message.direction === "outbound";
  const [picker, setPicker] = useState(false);

  const canReact = !outbound && !!onReact;
  const mine = message.myReaction ?? null;
  const mineEmoji = REACTIONS.find((r) => r.value === mine)?.emoji;

  const choose = (reaction: TFbReaction | null) => {
    setPicker(false);
    onReact?.(message, reaction);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1",
        outbound ? "justify-end" : "justify-start",
      )}
    >
      <div className={cn("relative max-w-[75%]", mineEmoji && "mb-3")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
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
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
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

        {mineEmoji && (
          <button
            type="button"
            title="Remove reaction"
            onClick={() => choose(null)}
            className="absolute -bottom-3 left-2 rounded-full border bg-background px-1.5 text-xs shadow-sm"
          >
            {mineEmoji}
          </button>
        )}
      </div>

      {canReact && (
        <div className="relative">
          <button
            type="button"
            aria-label="React to message"
            onClick={() => setPicker((v) => !v)}
            className="rounded-full p-1 text-muted-foreground opacity-60 transition hover:bg-muted focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <SmilePlus className="h-4 w-4" />
          </button>

          {picker && (
            <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-full border bg-background px-2 py-1 shadow-md">
              {REACTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => choose(r.value)}
                  className={cn(
                    "rounded-full px-0.5 text-lg transition hover:scale-125",
                    mine === r.value && "bg-muted",
                  )}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}