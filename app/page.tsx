"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import useStoreUser from "@/hooks/useStoreUser";
import { usePresence } from "@/hooks/usePresence";
import { Id } from "@/convex/_generated/dataModel";

export default function Page() {
  const { isLoading } = useStoreUser();
  usePresence();

  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        className={
          selectedConversationId
            ? "hidden md:flex md:w-80"
            : "flex w-full md:w-80"
        }
      />
      <ChatArea
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
        className={selectedConversationId ? "flex" : "hidden md:flex"}
      />
    </main>
  );
}
