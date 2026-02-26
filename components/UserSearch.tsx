"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function UserSearch({
  onSelectCallback,
}: {
  onSelectCallback: (conversationId: Id<"conversations">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const users = useQuery(api.users.search, { searchQuery: query });
  const getOrCreate = useMutation(api.conversations.getOrCreate);

  const handleSelect = async (otherUserId: Id<"users">) => {
    try {
      const convId = await getOrCreate({ otherUserId });
      onSelectCallback(convId);
      setOpen(false);
      setQuery("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground bg-muted/50 border-none shadow-none"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search users...
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Type a name to search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {users === undefined ? (
              <CommandEmpty>Loading users...</CommandEmpty>
            ) : users.length === 0 ? (
              <CommandEmpty>No users found.</CommandEmpty>
            ) : (
              <CommandGroup heading="Suggestions">
                {users.map((u) => (
                  <CommandItem
                    key={u._id}
                    value={u.name}
                    onSelect={() => handleSelect(u._id)}
                    className="flex items-center gap-3 cursor-pointer py-2"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.image} />
                        <AvatarFallback>
                          {u.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-background bg-green-500 rounded-full" />
                      )}
                    </div>
                    <span>{u.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
