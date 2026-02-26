"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import UserSearch from "./UserSearch";
import ConversationList from "./ConversationList";
import { Id } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { user } = useUser();
  const selectedConversationId = useChatStore(
    (state) => state.selectedConversationId,
  );
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation,
  );

  return (
    <div
      className={cn(
        "h-full border-r border-border bg-muted/30 flex-col shrink-0",
        selectedConversationId
          ? "hidden md:flex md:w-80"
          : "flex w-full md:w-80",
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">ChatApp</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user?.firstName}</span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
      <div className="p-4 border-b border-border">
        <UserSearch onSelectCallback={setSelectedConversation} />
      </div>
      <ConversationList onSelect={(id) => setSelectedConversation(id)} />
    </div>
  );
}
