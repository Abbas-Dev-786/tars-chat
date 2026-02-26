import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

export function ChatHeader() {
  const setSelectedConversationId = useChatStore(
    (state) => state.setSelectedConversation,
  );
  const onBack = () => setSelectedConversationId(null);

  return (
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
  );
}
