// "use client";

// import { Search } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { cn } from "@/lib/utils";
// import type { IFbConversation } from "@/types/facebook.types";

// import {
//     FbTab,
//     getAssignee,
//     getInitials,
//     STATUS_STYLES,
//     timeAgo
// } from "@/utils/inbox.utils";

// interface Props {
//     conversations: IFbConversation[];
//     isLoading: boolean;
//     total: number;
//     selectedId: string | null;
//     tabs: { value: FbTab; label: string }[];
//     tab: FbTab;
//     onTabChange: (tab: FbTab) => void;
//     search: string;
//     onSearchChange: (value: string) => void;
//     onSelect: (conversation: IFbConversation) => void;
//     onLoadMore: () => void;
// }

// export default function ConversationList({
//     conversations,
//     isLoading,
//     total,
//     selectedId,
//     tabs,
//     tab,
//     onTabChange,
//     search,
//     onSearchChange,
//     onSelect,
//     onLoadMore,
// }: Props) {
//     return (
//         <div className="flex h-full flex-col">
//             <div className="space-y-3 border-b p-3">
//                 <Tabs value={tab} onValueChange={(v) => onTabChange(v as FbTab)}>
//                     <TabsList className="w-full">
//                         {tabs.map((t) => (
//                             <TabsTrigger key={t.value} value={t.value} className="flex-1">
//                                 {t.label}
//                             </TabsTrigger>
//                         ))}
//                     </TabsList>
//                 </Tabs>

//                 <div className="relative">
//                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                     <Input
//                         value={search}
//                         onChange={(e) => onSearchChange(e.target.value)}
//                         placeholder="Search customer..."
//                         className="pl-8"
//                     />
//                 </div>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//                 {isLoading ? (
//                     <div className="space-y-1 p-2">
//                         {Array.from({ length: 8 }).map((_, i) => (
//                             <div key={i} className="flex items-center gap-3 p-2">
//                                 <Skeleton className="h-10 w-10 rounded-full" />
//                                 <div className="flex-1 space-y-2">
//                                     <Skeleton className="h-3 w-2/3" />
//                                     <Skeleton className="h-3 w-1/3" />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : conversations.length === 0 ? (
//                     <p className="p-6 text-center text-sm text-muted-foreground">
//                         No conversations found
//                     </p>
//                 ) : (
//                     <>
//                         {conversations.map((c) => {
//                             const assignee = getAssignee(c);
//                             const status = STATUS_STYLES[c.status];
//                             const unread = c.unreadCount > 0;

//                             return (
//                                 <button
//                                     key={c._id}
//                                     type="button"
//                                     onClick={() => onSelect(c)}
//                                     className={cn(
//                                         "flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/60",
//                                         selectedId === c._id && "bg-muted",
//                                     )}
//                                 >
//                                     <Avatar className="h-10 w-10 shrink-0">
//                                         <AvatarImage src={c.profilePic} alt={c.customerName} />
//                                         <AvatarFallback>{getInitials(c.customerName)}</AvatarFallback>
//                                     </Avatar>

//                                     <div className="min-w-0 flex-1">
//                                         <div className="flex items-center justify-between gap-2">
//                                             <p
//                                                 className={cn(
//                                                     "truncate text-sm",
//                                                     unread ? "font-semibold" : "font-medium",
//                                                 )}
//                                             >
//                                                 {c.customerName}
//                                             </p>
//                                             <span className="shrink-0 text-xs text-muted-foreground">
//                                                 {timeAgo(c.lastMessageAt)}
//                                             </span>
//                                         </div>

//                                         <div className="mt-1 flex items-center justify-between gap-2">
//                                             <div className="flex min-w-0 items-center gap-2">
//                                                 <Badge
//                                                     variant="outline"
//                                                     className={cn("px-1.5 py-0 text-[10px]", status.className)}
//                                                 >
//                                                     {status.label}
//                                                 </Badge>
//                                                 <span className="truncate text-xs text-muted-foreground">
//                                                     {assignee?.name ?? ""}
//                                                 </span>
//                                             </div>
//                                             {unread && (
//                                                 <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
//                                                     {c.unreadCount}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </button>
//                             );
//                         })}

//                         {conversations.length < total && (
//                             <div className="p-3">
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="w-full"
//                                     onClick={onLoadMore}
//                                 >
//                                     Load more
//                                 </Button>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }



"use client";

import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { IFbConversation } from "@/types/facebook.types";

import {
    timeAgo,
    FbTab,
    getAssignee,
    getInitials,
    STATUS_STYLES,
} from "@/utils/inbox.utils";

interface Props {
    conversations: IFbConversation[];
    isLoading: boolean;
    total: number;
    selectedId: string | null;
    tabs: { value: FbTab; label: string }[];
    tab: FbTab;
    onTabChange: (tab: FbTab) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onSelect: (conversation: IFbConversation) => void;
    onLoadMore: () => void;
}

export default function ConversationList({
    conversations,
    isLoading,
    total,
    selectedId,
    tabs,
    tab,
    onTabChange,
    search,
    onSearchChange,
    onSelect,
    onLoadMore,
}: Props) {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-3 border-b p-3">
                <Tabs value={tab} onValueChange={(v) => onTabChange(v as FbTab)}>
                    <TabsList className="w-full">
                        {tabs.map((t) => (
                            <TabsTrigger key={t.value} value={t.value} className="flex-1">
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search customer..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                        No conversations found
                    </p>
                ) : (
                    <>
                        {conversations.map((c) => {
                            const assignee = getAssignee(c);
                            const status = STATUS_STYLES[c.status];
                            const unread = c.unreadCount > 0;

                            return (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => onSelect(c)}
                                    className={cn(
                                        "flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/60",
                                        selectedId === c._id && "bg-muted",
                                    )}
                                >
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarImage src={c.profilePic} alt={c.customerName} />
                                        <AvatarFallback>{getInitials(c.customerName)}</AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p
                                                className={cn(
                                                    "truncate text-sm",
                                                    unread ? "font-semibold" : "font-medium",
                                                )}
                                            >
                                                {c.customerName}
                                            </p>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {timeAgo(c.lastMessageAt)}
                                            </span>
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("px-1.5 py-0 text-[10px]", status.className)}
                                                >
                                                    {status.label}
                                                </Badge>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {assignee?.name ?? ""}
                                                </span>
                                            </div>
                                            {unread && (
                                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                                                    {c.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {conversations.length < total && (
                            <div className="p-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={onLoadMore}
                                >
                                    Load more
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}