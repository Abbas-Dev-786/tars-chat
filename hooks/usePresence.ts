import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function usePresence() {
  const updatePresence = useMutation(api.users.updatePresence);

  useEffect(() => {
    let mounted = true;

    const setPresence = async () => {
      if (!mounted) return;
      try {
        await updatePresence();
      } catch (error) {
        console.error("Failed to update presence", error);
      }
    };

    setPresence();

    // Ping every 10 seconds to keep lastSeen current
    const intervalId = setInterval(setPresence, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [updatePresence]);
}
