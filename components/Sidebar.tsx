"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import UserSearch from "./UserSearch";
import ConversationList from "./ConversationList";
import { Id } from "@/convex/_generated/dataModel";

export default function Sidebar({
  selectedConversationId,
  onSelectConversation,
  className = "",
}: {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  className?: string;
}) {
  const { user } = useUser();

  return (
    <div
      className={`h-full border-r border-border bg-muted/30 flex-col shrink-0 ${className}`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">ChatApp</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user?.firstName}</span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
      <div className="p-4 border-b border-border">
        <UserSearch onSelectCallback={onSelectConversation} />
      </div>
      <ConversationList
        selectedConversationId={selectedConversationId}
        onSelect={onSelectConversation}
      />
    </div>
  );
}
