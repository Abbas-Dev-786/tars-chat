import { formatMessageTime } from "@/lib/formatTime";

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
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`px-4 py-2 max-w-[70%] break-words shadow-sm transition-all animate-in slide-in-from-bottom-2 fade-in duration-300 ${
          isMe
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-background border border-border rounded-2xl rounded-bl-sm"
        }`}
      >
        <p className="text-sm">{msg.content}</p>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 mx-1">
        {formatMessageTime(msg._creationTime)}
      </span>
    </div>
  );
}
