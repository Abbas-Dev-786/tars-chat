"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatMessageTime } from "@/lib/formatTime";
import { Id } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/useChatStore";

export default function ConversationList({
  onSelect,
}: {
  onSelect: (id: Id<"conversations">) => void;
}) {
  const selectedConversationId = useChatStore(
    (state) => state.selectedConversationId,
  );
  const conversations = useQuery(api.conversations.list);

  if (conversations === undefined) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground mt-4">
        No conversations yet. Search for a user to start chatting!
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
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
      </div>
    </ScrollArea>
  );
}
