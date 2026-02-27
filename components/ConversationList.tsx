"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMessageTime } from "@/lib/formatTime";
import { Id } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/useChatStore";

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="h-3 w-40 rounded" />
      </div>
    </div>
  );
}

export default function ConversationList({
  onSelect,
}: {
  onSelect: (id: Id<"conversations">) => void;
}) {
  const selectedConversationId = useChatStore(
    (state) => state.selectedConversationId,
  );
  const {
    results: conversations,
    status: conversationsStatus,
    loadMore,
  } = usePaginatedQuery(api.conversations.list, {}, { initialNumItems: 20 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Check if scrolled near bottom to load more
    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      conversationsStatus === "CanLoadMore"
    ) {
      loadMore(20);
    }
  };

  if (
    conversations === undefined &&
    conversationsStatus === "LoadingFirstPage"
  ) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 mt-4 text-center">
        <span className="text-2xl">💬</span>
        <p className="text-sm font-medium text-foreground">
          No conversations yet
        </p>
        <p className="text-xs text-muted-foreground">
          Search for a user above to start chatting!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea
      className="flex-1"
      viewportRef={scrollRef}
      onScrollCapture={handleScroll}
    >
      <div className="flex flex-col gap-1 p-2">
        {conversations.map((conv) => {
          const isSelected = selectedConversationId === conv.id;
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.otherUser?.image} />
                  <AvatarFallback>
                    {conv.otherUser?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                {conv.otherUser?.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-background bg-green-500 rounded-full" />
                )}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm truncate">
                    {conv.otherUser?.name}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatMessageTime(conv.lastMessage._creationTime)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span
                    className={`text-xs truncate ${
                      conv.hasUnread
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conv.lastMessage?.content || "No messages yet"}
                  </span>
                  {(conv.unreadCount > 0 || conv.hasUnread) && (
                    <div className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold h-5 min-w-[20px] rounded-full px-1.5 ml-2">
                      {conv.unreadCount > 0
                        ? conv.unreadCount > 99
                          ? "99+"
                          : conv.unreadCount
                        : 1}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-4 w-full flex justify-center py-2">
          {conversationsStatus === "LoadingMore" && (
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
