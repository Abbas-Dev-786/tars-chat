import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

interface ChatState {
  selectedConversationId: Id<"conversations"> | null;
  setSelectedConversation: (id: Id<"conversations"> | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedConversationId: null,
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
}));
