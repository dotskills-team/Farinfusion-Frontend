
"use client";
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { facebookApi } from "@/redux/features/facebook/facebook.api";
import type {
  IFbSocketAssignmentEvent,
  IFbSocketMessageEvent,
  IFbSocketSlaEvent,
} from "@/types/facebook.types";
import { baseApi } from "@/redux/features/baseApi";

// Listens to backend socket events and refetches the affected RTK Query data.
// Needs NEXT_PUBLIC_SOCKET_URL (server origin, without /api/v1).
export const useFbSocket = () => {
  const dispatch = useDispatch<ThunkDispatch<any, unknown, UnknownAction>>();

  useEffect(() => {
    // The backend reads the accessToken cookie from the handshake
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      withCredentials: true,
    });

    let firstConnect = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    socket.on("connect", () => {
      console.log("FB socket connected");
      // After a reconnect, refetch everything in case events were missed meanwhile
      if (!firstConnect) {
        dispatch(
          baseApi.util.invalidateTags(["FB_CONVERSATIONS", "FB_MESSAGES"]),
        );
      }
      firstConnect = false;
    });

    socket.on(
      "fb:message",
      ({ conversationId, message }: IFbSocketMessageEvent) => {
        // Show the new message right away. Meta's Conversations API can take a
        // while before it returns it. The refetch below reconciles afterwards
        console.log("FB socket event: fb:message", conversationId);
        if (message) {
          try {
            dispatch(
              facebookApi.util.updateQueryData(
                "getFbMessages",
                { id: conversationId },
                (draft) => {
                  if (!draft.data.messages.some((m) => m.id === message.id)) {
                    draft.data.messages.push({ ...message, local: true });
                  }
                },
              ),
            );
          } catch (err) {
            // Never let this block the refetch below
            console.error("FB cache update failed:", err);
          }
        }

        dispatch(
          baseApi.util.invalidateTags([
            "FB_CONVERSATIONS",
            { type: "FB_MESSAGES", id: conversationId },
          ]),
        );
      },
    );

    socket.on(
      "fb:assignment",
      ({ conversationId }: IFbSocketAssignmentEvent) => {
        dispatch(
          baseApi.util.invalidateTags([
            "FB_CONVERSATIONS",
            "FB_MODERATORS",
            { type: "FB_MESSAGES", id: conversationId },
          ]),
        );
      },
    );

    socket.on("fb:sla-breach", ({ customerName }: IFbSocketSlaEvent) => {
      toast.warning(`${customerName} is still waiting for a reply`);
      dispatch(baseApi.util.invalidateTags(["FB_CONVERSATIONS"]));
    });

    socket.on("connect_error", (err) => {
      console.error("Facebook socket error:", err.message);
      // socket.io does not retry a handshake the server rejected (e.g. an expired
      // token), so retry manually
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        if (!socket.connected) socket.connect();
      }, 5000);
    });

    // Reconnect when the user comes back to the tab
    const onVisible = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        socket.connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisible);
      socket.disconnect();
    };
  }, [dispatch]);
};