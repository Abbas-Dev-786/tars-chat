"use client";

import { useQuery, useMutation } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, ArrowDown } from "lucide-react";
import useStoreUser from "@/hooks/useStoreUser";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";

import { ChatHeader } from "./chat/ChatHeader";
import { ChatEmptyState } from "./chat/ChatEmptyState";
import { MessageBubble } from "./chat/MessageBubble";
import { TypingIndicator } from "./chat/TypingIndicator";
import { ChatInput } from "./chat/ChatInput";
import { formatDateSeparator } from "@/lib/formatTime";

function MessageSkeleton({ isMe }: { isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`h-10 rounded-2xl animate-pulse bg-muted ${isMe ? "w-48 rounded-br-sm" : "w-40 rounded-bl-sm"}`}
      />
    </div>
  );
}

export default function ChatArea() {
  const conversationId = useChatStore((state) => state.selectedConversationId);
  const { userId, isLoading: isUserLoading } = useStoreUser();

  const { results: conversations } = usePaginatedQuery(
    api.conversations.list,
    {},
    { initialNumItems: 10 },
  );

  const currentConversation = conversations?.find(
    (c: any) => c.id === conversationId,
  );
  const otherUser = currentConversation?.otherUser ?? undefined;

  const {
    results: messages,
    status: messagesStatus,
    loadMore,
  } = usePaginatedQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip",
    { initialNumItems: 10 },
  );

  const typers = useQuery(
    api.typing.get,
    conversationId ? { conversationId } : "skip",
  );

  const markRead = useMutation(api.conversations.markRead);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (!isScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isScrolledUp]);

  useEffect(() => {
    if (conversationId) {
      markRead({ conversationId }).catch(console.error);
    }
  }, [conversationId, markRead]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Check if scrolled near top to load more
    if (scrollTop < 50 && messagesStatus === "CanLoadMore") {
      loadMore(20);
    }

    setIsScrolledUp(scrollHeight - scrollTop - clientHeight > 50);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  };

  if (!conversationId) {
    return <ChatEmptyState />;
  }

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full relative bg-muted/10",
        conversationId ? "flex" : "hidden md:flex",
      )}
    >
      <ChatHeader otherUser={otherUser} />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {(messages === undefined && messagesStatus === "LoadingFirstPage") ||
        isUserLoading ||
        !userId ? (
          <>
            <MessageSkeleton isMe={false} />
            <MessageSkeleton isMe={true} />
            <MessageSkeleton isMe={false} />
            <MessageSkeleton isMe={true} />
            <MessageSkeleton isMe={false} />
          </>
        ) : messages.length === 0 && messagesStatus !== "LoadingFirstPage" ? (
          <div className="flex h-full items-center justify-center flex-col gap-3 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-muted-foreground ml-1" />
            </div>
            <span className="text-muted-foreground font-medium">
              No messages yet. Say hello!
            </span>
            <span className="text-muted-foreground text-sm">
              Send your first message below.
            </span>
          </div>
        ) : (
          <>
            <div className="h-4 w-full flex justify-center py-2">
              {messagesStatus === "LoadingMore" && (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
            </div>
            {[...messages].reverse().map((msg, index, array) => {
              const isMe = msg.senderId === userId;
              const currentDay = formatDateSeparator(msg._creationTime);
              const prevMsg = index > 0 ? array[index - 1] : null;
              const prevDay = prevMsg
                ? formatDateSeparator(prevMsg._creationTime)
                : null;
              const showDate = currentDay !== prevDay;

              return (
                <div key={msg._id} className="flex flex-col">
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-background/80 backdrop-blur-sm text-muted-foreground text-xs px-3 py-1 rounded-md shadow-sm border border-border/50 z-10">
                        {currentDay}
                      </span>
                    </div>
                  )}
                  <MessageBubble msg={msg} isMe={isMe} currentUserId={userId} />
                </div>
              );
            })}
          </>
        )}

        <TypingIndicator typers={typers} />
      </div>

      {isScrolledUp && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-24 right-6 rounded-full shadow-md z-10"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      <ChatInput onSend={scrollToBottom} />
    </div>
  );
}
