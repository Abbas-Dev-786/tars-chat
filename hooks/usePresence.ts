import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function usePresence() {
  const updatePresence = useMutation(api.users.updatePresence);

  useEffect(() => {
    const setPresence = async () => {
      try {
        await updatePresence();
      } catch (error) {
        console.error("Failed to update presence", error);
      }
    };

    setPresence();

    const intervalId = setInterval(setPresence, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [updatePresence]);
}
