import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, RefreshCw } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useThrottleCallback } from "@/hooks/use-debounce";

export function ChatInput({ onSend }: { onSend: () => void }) {
  const conversationId = useChatStore((state) => state.selectedConversationId);

  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);

  const throttledSetTyping = useThrottleCallback(() => {
    setTyping({ conversationId: conversationId! }).catch(console.error);
  }, 2000);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setSendError(null);
    throttledSetTyping();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !conversationId || isSending) return;

    setIsSending(true);
    setSendError(null);

    try {
      await sendMessage({
        conversationId,
        content: newMessage,
      });
      setNewMessage("");
      onSend();
    } catch {
      setSendError("Failed to send. Tap to retry.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      {sendError && (
        <button
          onClick={() => handleSend()}
          className="w-full text-xs text-destructive mb-2 flex items-center gap-1.5 hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          {sendError}
        </button>
      )}
      <form onSubmit={handleSend} className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 min-h-[40px] max-h-[120px] bg-muted/50 border-none focus-visible:ring-1 resize-none py-3"
          rows={1}
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          size="icon"
          className="shrink-0 transition-transform active:scale-95"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
