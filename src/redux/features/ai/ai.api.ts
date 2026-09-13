import { baseApi } from "../baseApi";
import type { IResponse } from "@/types";

export interface IAiChatTurn {
  role: "user" | "model";
  text: string;
}

export interface IAiChatRequest {
  message: string;
  history?: IAiChatTurn[];
}

export interface IAiChatData {
  message: string;
  data?: unknown;
  toolCalls?: { collection: string; operation: string }[];
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ⭐ SEND CHAT MESSAGE (Admin AI Database Assistant)
    sendAiChatMessage: builder.mutation<IResponse<IAiChatData>, IAiChatRequest>({
      query: (payload) => ({
        url: "/ai/chat",
        method: "POST",
        data: payload,
      }),
    }),

  }),

  overrideExisting: true,
});

export const { useSendAiChatMessageMutation } = aiApi;