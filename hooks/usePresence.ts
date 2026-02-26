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
        await updatePresence({ isOnline: true });
      } catch (error) {
        console.error("Failed to update presence", error);
      }
    };

    setPresence();

    const intervalId = setInterval(setPresence, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      // Attempt to set offline on unmount
      updatePresence({ isOnline: false }).catch(console.error);
    };
  }, [updatePresence]);
}
