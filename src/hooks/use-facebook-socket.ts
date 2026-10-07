"use client";
/* eslint-disable no-console */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "sonner";
import type {
  IFbSocketAssignmentEvent,
  IFbSocketMessageEvent,
  IFbSocketSlaEvent,
} from "@/types/facebook.types";
import { baseApi } from "@/redux/features/baseApi";

// Listens to backend socket events and refetches the affected RTK Query data.
// Needs NEXT_PUBLIC_SOCKET_URL (server origin, without /api/v1).
export const useFbSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // The backend reads the accessToken cookie from the handshake
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      withCredentials: true,
    });

    socket.on("fb:message", ({ conversationId }: IFbSocketMessageEvent) => {
      dispatch(
        baseApi.util.invalidateTags([
          "FB_CONVERSATIONS",
          { type: "FB_MESSAGES", id: conversationId },
        ]),
      );
    });

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
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
};