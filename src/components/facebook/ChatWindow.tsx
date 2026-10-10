
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  facebookApi,
  useGetFbMessagesQuery,
  useReactFbMessageMutation,
  useReplyFbConversationMutation,
} from "@/redux/features/facebook/facebook.api";

import type {
  IFbConversation,
  IFbMessage,
  TFbReaction,
} from "@/types/facebook.types";
import MessageBubble from "./MessageBubble";
import { baseApi } from "@/redux/features/baseApi";
import { formatDay, getAssignee, getErrorMessage, getInitials, MANAGEMENT_ROLES, STATUS_STYLES } from "@/utils/inbox.utils";


const DAY = 24 * 60 * 60 * 1000;

interface Props {
  conversation: IFbConversation;
  user?: { _id?: string; role?: string };
  onBack: () => void;
}

// Render this with key={conversation._id} so state resets per conversation
export default function ChatWindow({ conversation, user, onBack }: Props) {
  const id = conversation._id;
  const dispatch = useDispatch();

  const { data, isLoading, isError, error, refetch } = useGetFbMessagesQuery({
    id,
  });
  const [fetchOlder, { isFetching: loadingOlder }] =
    facebookApi.useLazyGetFbMessagesQuery();
  const [reply, { isLoading: sending }] = useReplyFbConversationMutation();
  const [react] = useReactFbMessageMutation();

  // Every message seen so far, keyed by id. Keeps older pages and avoids
  // gaps when the latest page window moves forward on refetch.
  const [store, setStore] = useState<Record<string, IFbMessage>>({});
  const [olderCursor, setOlderCursor] = useState<string | null | undefined>(
    undefined,
  );
  const [text, setText] = useState("");
  const [now] = useState(() => Date.now());

  const bottomRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);

  useEffect(() => {
    const incoming = data?.data.messages;
    if (!incoming?.length) return;
    setStore((prev) => {
      const next = { ...prev };
      incoming.forEach((m) => {
        // Keep the sender name if an earlier copy of this message had it
        next[m.id] = {
          ...m,
          sentByName: m.sentByName ?? prev[m.id]?.sentByName ?? null,
          // The server only knows reactions for recent messages, so keep ours otherwise
          myReaction:
            m.myReaction !== undefined ? m.myReaction : prev[m.id]?.myReaction,
        };
      });

      // Drop a socket-pushed copy once the same message is fetched under another id
      const fetched = incoming.filter((m) => !m.local);
      Object.values(next).forEach((x) => {
        const duplicated = fetched.some(
          (f) =>
            f.id !== x.id && f.direction === x.direction && f.text === x.text,
        );
        if (x.local && duplicated) delete next[x.id];
      });

      return next;
    });
  }, [data]);

  // The backend resets unreadCount when messages are fetched, so refresh the list once
  useEffect(() => {
    if (data) dispatch(baseApi.util.invalidateTags(["FB_CONVERSATIONS"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data.conversation._id]);

  const messages = useMemo(
    () =>
      Object.values(store).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [store],
  );

  // undefined = still using the cursor from the latest page
  const cursor =
    olderCursor === undefined ? (data?.data.nextCursor ?? null) : olderCursor;

  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (!lastId) return;
    bottomRef.current?.scrollIntoView({
      behavior: firstScroll.current ? "auto" : "smooth",
    });
    firstScroll.current = false;
  }, [lastId]);

  const loadOlder = async () => {
    if (!cursor) return;
    const request = fetchOlder({ id, after: cursor });
    try {
      const res = await request.unwrap();
      setStore((prev) => {
        const next = { ...prev };
        res.data.messages.forEach((m) => {
          next[m.id] = m;
        });
        return next;
      });
      setOlderCursor(res.data.nextCursor);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      request.unsubscribe();
    }
  };

  const handleReact = async (
    message: IFbMessage,
    reaction: TFbReaction | null,
  ) => {
    const previous = store[message.id]?.myReaction ?? null;
    // Optimistic: show it right away, roll back if Facebook rejects it
    setStore((prev) => ({
      ...prev,
      [message.id]: { ...prev[message.id], myReaction: reaction },
    }));
    try {
      await react({ id, messageId: message.id, reaction }).unwrap();
    } catch (err) {
      setStore((prev) => ({
        ...prev,
        [message.id]: { ...prev[message.id], myReaction: previous },
      }));
      toast.error(getErrorMessage(err));
    }
  };

  const handleSend = async () => {
    const value = text.trim();
    if (!value || sending) return;
    try {
      await reply({ id, text: value }).unwrap();
      setText("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const assignee = getAssignee(conversation);
  const status = STATUS_STYLES[conversation.status];

  // Every chat role can reply to every conversation
  const canReply =
    !!user?.role && [...MANAGEMENT_ROLES, "MODERATOR"].includes(user.role);

  const windowExpired = conversation.lastCustomerMessageAt
    ? now - new Date(conversation.lastCustomerMessageAt).getTime() > DAY
    : true;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar className="h-9 w-9">
          <AvatarImage
            src={conversation.profilePic}
            alt={conversation.customerName}
          />
          <AvatarFallback>
            {getInitials(conversation.customerName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{conversation.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
          </p>
        </div>

        <Badge variant="outline" className={cn(status.className)}>
          {status.label}
        </Badge>

        {/* Actions (claim, assign, transfer, close, add to lead) go here in the next steps */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4">
        {cursor && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOlder}
              disabled={loadingOlder}
            >
              {loadingOlder && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Load older messages
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="ml-auto h-10 w-1/3" />
            <Skeleton className="h-10 w-2/5" />
          </div>
        ) : isError && messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(error)}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m, i) => {
              const showDay =
                i === 0 ||
                formatDay(messages[i - 1].createdAt) !== formatDay(m.createdAt);

              return (
                <div key={m.id} className="space-y-2">
                  {showDay && (
                    <div className="py-2 text-center text-xs text-muted-foreground">
                      {formatDay(m.createdAt)}
                    </div>
                  )}
                  <MessageBubble
                    message={m}
                    onReact={canReply ? handleReact : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        {!canReply ? (
          <p className="text-center text-sm text-muted-foreground">
            This conversation is read-only for you.
          </p>
        ) : (
          <>
            {windowExpired && (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                The customer&apos;s last message is over 24 hours old. Facebook
                only delivers this with the HUMAN_AGENT permission (up to 7
                days).
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                rows={1}
                maxLength={2000}
                className="max-h-32 min-h-[44px] resize-none"
              />
              <Button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}