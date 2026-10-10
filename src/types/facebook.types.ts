
export type TFbConvStatus = "UNASSIGNED" | "OPEN" | "CONVERTED" | "CLOSED";
export type TChatStatus = "ONLINE" | "OFFLINE";
export type TFbReaction = "like" | "love" | "smile" | "wow" | "sad" | "angry";
export type TFbAssignType =
  "AUTO" | "MANUAL" | "TRANSFER" | "CLAIM" | "RELEASE" | "SLA";

export interface IFbUserRef {
  _id: string;
  name: string;
  role?: string;
  picture?: string;
  chatStatus?: TChatStatus;
}

export interface IFbConversation {
  _id: string;
  psid: string;
  fbThreadId?: string;
  customerName: string;
  profilePic?: string;
  lastMessageAt: string;
  lastCustomerMessageAt?: string;
  awaitingReplySince?: string | null;
  unreadCount: number;
  status: TFbConvStatus;
  // List-e populate hoye object ashe, onno jaygay id string
  assignedTo: IFbUserRef | string | null;
  assignedAt?: string | null;
  lead?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFbAttachment {
  type?: string;
  name?: string;
  url?: string;
}

export interface IFbMessage {
  id: string;
  text: string;
  direction: "inbound" | "outbound";
  createdAt: string;
  sentByName?: string | null;
  attachments: IFbAttachment[];
  // true for a message pushed over the socket before Meta's API returns it
  local?: boolean;
  // Our reaction on this message, if known
  myReaction?: TFbReaction | null;
}

export interface IFbMessagesData {
  conversation: IFbConversation;
  messages: IFbMessage[];
  nextCursor: string | null;
}

export interface IFbModerator {
  _id: string;
  name: string;
  picture?: string;
  chatStatus: TChatStatus;
  openChats: number;
}

export interface IFbAssignmentLog {
  _id: string;
  conversation: string;
  from: IFbUserRef | null;
  to: IFbUserRef | null;
  by: IFbUserRef | null;
  type: TFbAssignType;
  note?: string;
  createdAt: string;
}

export interface IFbSettings {
  autoAssign: boolean;
  slaMinutes: number;
  returnToPoolMinutes: number;
}

export interface IFbReportRow {
  moderatorId: string;
  name: string;
  chatStatus: TChatStatus;
  replies: number;
  conversationsReplied: number;
  assigned: number;
  converted: number;
}

export interface IFbSentMessage {
  id: string;
  text: string;
  direction: "outbound";
  createdAt: string;
}

export interface IFbConversationsResponse {
  success: boolean;
  message?: string;
  data: IFbConversation[];
  meta: {
    page?: number;
    limit?: number;
    total: number;
    totalPage: number;
  };
}

// Socket events (backend theke ashe)
export interface IFbSocketMessageEvent {
  conversationId: string;
  assignedTo: string | null;
  direction: "inbound" | "outbound";
  message?: IFbMessage;
}

export interface IFbSocketAssignmentEvent {
  conversationId: string;
  assignedTo: string | null;
}

export interface IFbSocketSlaEvent {
  conversationId: string;
  customerName: string;
  assignedTo: string | null;
}