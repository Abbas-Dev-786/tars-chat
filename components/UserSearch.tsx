"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function UserSearch({
  onSelectCallback,
}: {
  onSelectCallback: (conversationId: Id<"conversations">) => void;
}) {
  const [query, setQuery] = useState("");
  const users = useQuery(api.users.search, { searchQuery: query });
  const getOrCreate = useMutation(api.conversations.getOrCreate);

  const handleSelect = async (otherUserId: Id<"users">) => {
    try {
      const convId = await getOrCreate({ otherUserId });
      onSelectCallback(convId);
      setQuery(""); // clear search
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 bg-muted/50 border-none focus-visible:ring-1"
        />
      </div>

      {query.length > 0 && (
        <ScrollArea className="h-[250px] border border-border rounded-md bg-background shadow-md">
          <div className="p-1">
            {users === undefined ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                Searching...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No users found
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelect(u._id)}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image} />
                      <AvatarFallback>
                        {u.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="font-medium text-sm truncate">
                      {u.name}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
