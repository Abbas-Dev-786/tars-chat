"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { formatDateSeparator, formatTimeOnly } from "@/lib/formatTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OtherUser {
  name: string;
  image?: string;
  isOnline: boolean;
  lastSeen: number;
}

interface ChatHeaderProps {
  otherUser?: OtherUser;
}

export function ChatHeader({ otherUser }: ChatHeaderProps) {
  const setSelectedConversationId = useChatStore(
    (state) => state.setSelectedConversation,
  );
  const onBack = () => setSelectedConversationId(null);

  return (
    <div className="h-16 border-b border-border bg-background p-4 flex items-center shadow-sm z-10 gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      {otherUser ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.image} />
              <AvatarFallback>
                {otherUser.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background bg-green-500 rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm leading-tight">
              {otherUser.name}
            </h2>
            <span className="text-xs text-muted-foreground">
              {otherUser.isOnline
                ? "Online"
                : `Last seen ${formatDateSeparator(otherUser.lastSeen)} at ${formatTimeOnly(otherUser.lastSeen)}`}
            </span>
          </div>
        </div>
      ) : (
        <h2 className="font-semibold text-lg">Conversation</h2>
      )}
    </div>
  );
}
