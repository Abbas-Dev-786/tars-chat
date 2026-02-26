import { formatTimeOnly } from "@/lib/formatTime";

interface MessageBubbleProps {
  msg: {
    _id: string;
    content: string;
    senderId: string;
    _creationTime: number;
  };
  isMe: boolean;
}

export function MessageBubble({ msg, isMe }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col mb-1 ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`px-3 py-1.5 pb-2.5 max-w-[80%] min-w-[80px] shadow-sm transition-all animate-in slide-in-from-bottom-2 fade-in duration-300 relative ${
          isMe
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-background border border-border rounded-2xl rounded-bl-sm"
        }`}
      >
        <p className="text-[15px] leading-snug break-words">{msg.content}</p>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 mx-1">
        {formatTimeOnly(msg._creationTime)}
      </span>
    </div>
  );
}
