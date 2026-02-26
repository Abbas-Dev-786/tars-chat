"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import useStoreUser from "@/hooks/useStoreUser";
import { usePresence } from "@/hooks/usePresence";
import PageLoader from "@/components/PageLoader";

export default function Page() {
  const { isLoading } = useStoreUser();
  usePresence();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <ChatArea />
    </main>
  );
}
