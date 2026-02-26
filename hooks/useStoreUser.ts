import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function useStoreUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const store = useMutation(api.users.store);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      store().then(setUserId).catch(console.error);
    } else if (!isLoading && !isAuthenticated) {
      setUserId(null); // Reset if user logs out
    }
  }, [isLoading, isAuthenticated, store]);

  return {
    userId,
    isLoading: isLoading || (isAuthenticated && userId === null),
  };
}
