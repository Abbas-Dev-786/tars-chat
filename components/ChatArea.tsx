"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowDown, ArrowLeft } from "lucide-react";
import { formatMessageTime } from "@/lib/formatTime";
import { Id } from "@/convex/_generated/dataModel";
import useStoreUser from "@/hooks/useStoreUser";

export default function ChatArea({
  conversationId,
  onBack,
  className = "",
}: {
  conversationId: Id<"conversations"> | null;
  onBack?: () => void;
  className?: string;
}) {
  const { userId } = useStoreUser();
  const [newMessage, setNewMessage] = useState("");

  const messages = useQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip",
  );

  const typers = useQuery(
    api.typing.get,
    conversationId ? { conversationId } : "skip",
  );

  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);
  const markRead = useMutation(api.conversations.markRead);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Auto-scroll logic depending on if user is scrolled up
  useEffect(() => {
    if (!scrollRef.current) return;
    if (!isScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isScrolledUp]);

  // Handle Mark as Read whenever conversation changes
  useEffect(() => {
    if (conversationId) {
      markRead({ conversationId }).catch(console.error);
    }
  }, [conversationId, messages, markRead]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // We consider it scrolled up if we're more than 50px away from the bottom
    const isUp = scrollHeight - scrollTop - clientHeight > 50;
    setIsScrolledUp(isUp);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (conversationId) {
      setTyping({ conversationId }).catch(console.error);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage({
        conversationId,
        content: newMessage,
      });
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  if (!conversationId) {
    return (
      <div
        className={`flex-1 h-full hidden md:flex items-center justify-center text-muted-foreground bg-muted/10 ${className}`}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to your Chat</h2>
          <p>Select a conversation from the sidebar to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col h-full relative bg-muted/10 ${className}`}
    >
      {/* Header (could be extracted) */}
      <div className="h-16 border-b border-border bg-background p-4 flex items-center shadow-sm z-10 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold text-lg">Conversation</h2>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {messages === undefined ? (
          <div className="flex justify-center p-4">
            <span className="text-muted-foreground text-sm">
              Loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground">
              No messages yet. Say hello!
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                  {formatMessageTime(msg._creationTime)}
                </span>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typers && typers.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            {typers.join(", ")} {typers.length > 1 ? "are" : "is"} typing...
          </div>
        )}
      </div>

      {/* Floating Scroll to bottom button */}
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

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-none focus-visible:ring-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            size="icon"
            className="shrink-0 transition-transform active:scale-95"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
