import { formatTimeOnly } from "@/lib/formatTime";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SmilePlus, Trash2, Ban } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageBubbleProps {
  msg: {
    _id: string;
    content: string;
    senderId: string;
    _creationTime: number;
    isDeleted?: boolean;
    reactions?: { emoji: string; userIds: string[] }[];
  };
  isMe: boolean;
  currentUserId: string;
}

export function MessageBubble({
  msg,
  isMe,
  currentUserId,
}: MessageBubbleProps) {
  const deleteMsg = useMutation(api.messages.deleteMsg);
  const react = useMutation(api.messages.react);

  const handleDelete = () => {
    deleteMsg({ messageId: msg._id as Id<"messages"> }).catch(console.error);
  };

  const handleReact = (emoji: string) => {
    react({ messageId: msg._id as Id<"messages">, emoji }).catch(console.error);
  };

  return (
    <div
      className={`flex flex-col mb-1 group ${isMe ? "items-end" : "items-start"}`}
    >
      <div
        className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Message Bubble */}
        <div
          className={`px-3 py-1.5 pb-2.5 max-w-[80%] min-w-[80px] shadow-sm transition-all animate-in slide-in-from-bottom-2 fade-in duration-300 relative ${
            isMe
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
              : "bg-background border border-border rounded-2xl rounded-bl-sm"
          }`}
        >
          {msg.isDeleted ? (
            <div className="flex items-center gap-1.5 text-[15px] pb-3 pr-10 italic opacity-70">
              <Ban className="w-4 h-4" />
              <span>This message was deleted</span>
            </div>
          ) : (
            <p className="text-[15px] leading-snug break-words pb-3 pr-12">
              {msg.content}
            </p>
          )}

          <span
            className={`text-[10px] absolute bottom-1.5 right-3 ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formatTimeOnly(msg._creationTime)}
          </span>
        </div>

        {/* Action Buttons (visible on hover desktop, always on mobile) */}
        {!msg.isDeleted && (
          <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Popover>
              <PopoverTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <SmilePlus className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                className="w-auto p-2 rounded-full flex flex-row items-center gap-1 shadow-md"
              >
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="hover:bg-muted p-1.5 rounded-full text-xl transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {isMe && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reactions Display */}
      {msg.reactions && msg.reactions.length > 0 && (
        <div
          className={`flex flex-wrap gap-1 mt-1 z-10 ${isMe ? "pr-2" : "pl-2"}`}
        >
          {msg.reactions.map((r, i) => {
            const hasReacted = r.userIds.includes(currentUserId);
            return (
              <button
                key={i}
                onClick={() => !msg.isDeleted && handleReact(r.emoji)}
                disabled={msg.isDeleted}
                className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border shadow-sm transition-colors ${
                  hasReacted
                    ? "bg-primary/20 border-primary/30"
                    : "bg-background border-border/50"
                }`}
              >
                <span>{r.emoji}</span>
                {r.userIds.length > 1 && (
                  <span className="font-medium">{r.userIds.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
