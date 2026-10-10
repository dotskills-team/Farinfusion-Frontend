
import { baseApi } from "../baseApi";
import type { GetQueryParams, IResponse } from "@/types";
import type {
  IFbAssignmentLog,
  IFbConversation,
  IFbConversationsResponse,
  IFbMessagesData,
  IFbModerator,
  IFbReportRow,
  IFbSentMessage,
  IFbSettings,
  IFbUserRef,
  TChatStatus,
  TFbReaction,
} from "@/types/facebook.types";

type TFbConversationParams = GetQueryParams & {
  tab?: "mine" | "unassigned" | "all";
  status?: string;
};

export const facebookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET CONVERSATIONS (tab: mine | unassigned | all)
    getFbConversations: builder.query<
      IFbConversationsResponse,
      TFbConversationParams | void
    >({
      query: (params) => ({
        url: "/facebook/conversations",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["FB_CONVERSATIONS"],
    }),

    // GET MESSAGES (live from Meta). `after` = cursor for older messages
    getFbMessages: builder.query<
      IResponse<IFbMessagesData>,
      { id: string; after?: string }
    >({
      query: ({ id, after }) => ({
        url: `/facebook/conversations/${id}/messages`,
        method: "GET",
        params: after ? { after } : undefined,
      }),
      providesTags: (result, error, { id }) => [{ type: "FB_MESSAGES", id }],
    }),

    // REPLY
    replyFbConversation: builder.mutation<
      IResponse<IFbSentMessage>,
      { id: string; text: string }
    >({
      query: ({ id, text }) => ({
        url: `/facebook/conversations/${id}/reply`,
        method: "POST",
        data: { text },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FB_MESSAGES", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // REACT to a message (reaction null removes ours)
    reactFbMessage: builder.mutation<
      IResponse<{ messageId: string; reaction: TFbReaction | null }>,
      { id: string; messageId: string; reaction: TFbReaction | null }
    >({
      query: ({ id, messageId, reaction }) => ({
        url: `/facebook/conversations/${id}/react`,
        method: "POST",
        data: { messageId, reaction },
      }),
    }),

    // CLAIM (moderator takes a chat from the pool)
    claimFbConversation: builder.mutation<IResponse<IFbConversation>, string>({
      query: (id) => ({
        url: `/facebook/conversations/${id}/claim`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "FB_MESSAGES", id },
        { type: "FB_LOGS", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // ASSIGN / REASSIGN (admin, manager). moderatorId null = back to pool
    assignFbConversation: builder.mutation<
      IResponse<IFbConversation>,
      { id: string; moderatorId: string | null }
    >({
      query: ({ id, moderatorId }) => ({
        url: `/facebook/conversations/${id}/assign`,
        method: "PATCH",
        data: { moderatorId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FB_MESSAGES", id },
        { type: "FB_LOGS", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // TRANSFER (moderator -> moderator, with note)
    transferFbConversation: builder.mutation<
      IResponse<IFbConversation>,
      { id: string; toModeratorId: string; note?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/facebook/conversations/${id}/transfer`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FB_MESSAGES", id },
        { type: "FB_LOGS", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // OPEN / CLOSE
    updateFbConversationStatus: builder.mutation<
      IResponse<IFbConversation>,
      { id: string; status: "OPEN" | "CLOSED" }
    >({
      query: ({ id, status }) => ({
        url: `/facebook/conversations/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FB_MESSAGES", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // LINK LEAD (chat becomes CONVERTED)
    linkFbLead: builder.mutation<
      IResponse<IFbConversation>,
      { id: string; leadId: string }
    >({
      query: ({ id, leadId }) => ({
        url: `/facebook/conversations/${id}/link-lead`,
        method: "PATCH",
        data: { leadId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FB_MESSAGES", id },
        "FB_CONVERSATIONS",
        "FB_MODERATORS",
      ],
    }),

    // ASSIGNMENT LOGS (admin, manager)
    getFbAssignmentLogs: builder.query<IResponse<IFbAssignmentLog[]>, string>({
      query: (id) => ({
        url: `/facebook/conversations/${id}/logs`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "FB_LOGS", id }],
    }),

    // MODERATORS (for assign / transfer dropdown, with open chat count)
    getFbModerators: builder.query<IResponse<IFbModerator[]>, void>({
      query: () => ({
        url: "/facebook/moderators",
        method: "GET",
      }),
      providesTags: ["FB_MODERATORS"],
    }),

    // ONLINE / OFFLINE toggle (moderator)
    setFbAvailability: builder.mutation<
      IResponse<IFbUserRef>,
      { chatStatus: TChatStatus }
    >({
      query: ({ chatStatus }) => ({
        url: "/facebook/availability",
        method: "PATCH",
        data: { chatStatus },
      }),
      invalidatesTags: ["ME", "FB_CONVERSATIONS", "FB_MODERATORS", "FB_REPORT"],
    }),

    // SETTINGS
    getFbSettings: builder.query<IResponse<IFbSettings>, void>({
      query: () => ({
        url: "/facebook/settings",
        method: "GET",
      }),
      providesTags: ["FB_SETTINGS"],
    }),

    updateFbSettings: builder.mutation<
      IResponse<IFbSettings>,
      Partial<IFbSettings>
    >({
      query: (data) => ({
        url: "/facebook/settings",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["FB_SETTINGS"],
    }),

    // REPORT (moderator-wise, from / to = ISO date)
    getFbReport: builder.query<
      IResponse<IFbReportRow[]>,
      { from?: string; to?: string } | void
    >({
      query: (params) => ({
        url: "/facebook/report",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["FB_REPORT"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFbConversationsQuery,
  useGetFbMessagesQuery,
  useReplyFbConversationMutation,
  useReactFbMessageMutation,
  useClaimFbConversationMutation,
  useAssignFbConversationMutation,
  useTransferFbConversationMutation,
  useUpdateFbConversationStatusMutation,
  useLinkFbLeadMutation,
  useGetFbAssignmentLogsQuery,
  useGetFbModeratorsQuery,
  useSetFbAvailabilityMutation,
  useGetFbSettingsQuery,
  useUpdateFbSettingsMutation,
  useGetFbReportQuery,
} = facebookApi;