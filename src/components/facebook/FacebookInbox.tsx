// "use client";

// import { useEffect, useState } from "react";
// import { MessageCircle } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useGetFbConversationsQuery } from "@/redux/features/facebook/facebook.api";
// import { useGetMeQuery } from "@/redux/features/user/user.api";
// import type { IFbConversation } from "@/types/facebook.types";
// import { FbTab } from "@/utils/inbox.utils";
// import { useFbSocket } from "@/hooks/use-facebook-socket";
// import ConversationList from "./ConversionList";
// import ChatWindow from "./ChatWindow";


// const PAGE_SIZE = 30;

// const useDebounced = <T,>(value: T, delay = 400) => {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const timer = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(timer);
//   }, [value, delay]);
//   return debounced;
// };

// export default function FacebookInbox() {
//   useFbSocket();

//   const { data: me } = useGetMeQuery();
//   const user = me?.data;
//   const isModerator = user?.role === "MODERATOR";

//   // Moderators: own chats + pool. Admin/manager: everything
//   const tabs: { value: FbTab; label: string }[] = isModerator
//     ? [
//         { value: "mine", label: "Mine" },
//         { value: "unassigned", label: "Unassigned" },
//         { value: "all", label: "All" },
//       ]
//     : [
//         { value: "all", label: "All" },
//         { value: "unassigned", label: "Unassigned" },
//       ];

//   const [tab, setTab] = useState<FbTab | null>(null);
//   const activeTab: FbTab = tab ?? (isModerator ? "mine" : "all");

//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounced(search);
//   const [limit, setLimit] = useState(PAGE_SIZE);

//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [snapshot, setSnapshot] = useState<IFbConversation | null>(null);

//   const { data, isLoading } = useGetFbConversationsQuery({
//     tab: activeTab,
//     searchTerm: debouncedSearch || undefined,
//     limit,
//     sort: "-lastMessageAt",
//   });

//   const conversations = data?.data ?? [];
//   const total = data?.meta?.total ?? 0;

//   // Prefer the live list item, fall back to what was clicked
//   // (the chat stays open even if a tab/search change hides it from the list)
//   const selected =
//     conversations.find((c) => c._id === selectedId) ??
//     (snapshot?._id === selectedId ? snapshot : null);

//   return (
//     <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-lg border bg-background">
//       <div
//         className={cn(
//           "w-full flex-col border-r md:flex md:w-90 md:shrink-0",
//           selectedId ? "hidden" : "flex",
//         )}
//       >
//         <ConversationList
//           conversations={conversations}
//           isLoading={isLoading}
//           total={total}
//           selectedId={selectedId}
//           tabs={tabs}
//           tab={activeTab}
//           onTabChange={(value) => {
//             setTab(value);
//             setLimit(PAGE_SIZE);
//           }}
//           search={search}
//           onSearchChange={(value) => {
//             setSearch(value);
//             setLimit(PAGE_SIZE);
//           }}
//           onSelect={(c) => {
//             setSelectedId(c._id);
//             setSnapshot(c);
//           }}
//           onLoadMore={() => setLimit((prev) => prev + PAGE_SIZE)}
//         />
//       </div>

//       <div className={cn("min-w-0 flex-1", selectedId ? "flex" : "hidden md:flex")}>
//         {selected ? (
//           <ChatWindow
//             key={selected._id}
//             conversation={selected}
//             user={user}
//             onBack={() => setSelectedId(null)}
//           />
//         ) : (
//           <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
//             <MessageCircle className="h-10 w-10" />
//             <p className="text-sm">Select a conversation to start</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetFbConversationsQuery } from "@/redux/features/facebook/facebook.api";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import type { IFbConversation } from "@/types/facebook.types";
import ChatWindow from "./ChatWindow";
import { useFbSocket } from "@/hooks/use-facebook-socket";
import { FbTab } from "@/utils/inbox.utils";
import AvailabilityToggle from "./AvailablilityToggle";
import ConversationList from "./ConversionList";

const PAGE_SIZE = 30;

const useDebounced = <T,>(value: T, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export default function FacebookInbox() {
  useFbSocket();

  const { data: me } = useGetMeQuery();
  const user = me?.data;
  const isModerator = user?.role === "MODERATOR";

  // Moderators: own chats + pool. Admin/manager: everything
  const tabs: { value: FbTab; label: string }[] = isModerator
    ? [
        { value: "mine", label: "Mine" },
        { value: "unassigned", label: "Unassigned" },
        { value: "all", label: "All" },
      ]
    : [
        { value: "all", label: "All" },
        { value: "unassigned", label: "Unassigned" },
      ];

  const [tab, setTab] = useState<FbTab | null>(null);
  const activeTab: FbTab = tab ?? (isModerator ? "mine" : "all");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<IFbConversation | null>(null);

  const { data, isLoading } = useGetFbConversationsQuery({
    tab: activeTab,
    searchTerm: debouncedSearch || undefined,
    limit,
    sort: "-lastMessageAt",
  });

  const conversations = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  // Prefer the live list item, fall back to what was clicked
  // (the chat stays open even if a tab/search change hides it from the list)
  const selected =
    conversations.find((c) => c._id === selectedId) ??
    (snapshot?._id === selectedId ? snapshot : null);

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-lg border bg-background">
      <div
        className={cn(
          "w-full flex-col border-r md:flex md:w-90 md:shrink-0",
          selectedId ? "hidden" : "flex",
        )}
      >
        {isModerator && <AvailabilityToggle />}
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          total={total}
          selectedId={selectedId}
          tabs={tabs}
          tab={activeTab}
          onTabChange={(value) => {
            setTab(value);
            setLimit(PAGE_SIZE);
          }}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setLimit(PAGE_SIZE);
          }}
          onSelect={(c) => {
            setSelectedId(c._id);
            setSnapshot(c);
          }}
          onLoadMore={() => setLimit((prev) => prev + PAGE_SIZE)}
        />
      </div>

      <div className={cn("min-w-0 flex-1", selectedId ? "flex" : "hidden md:flex")}>
        {selected ? (
          <ChatWindow
            key={selected._id}
            conversation={selected}
            user={user}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="h-10 w-10" />
            <p className="text-sm">Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}