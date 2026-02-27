"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { usePresence } from "@/hooks/usePresence";
import useStoreUser from "@/hooks/useStoreUser";

export default function Page() {
  useStoreUser();
  usePresence();

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <ChatArea />
    </main>
  );
}
