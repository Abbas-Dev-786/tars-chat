export function TypingIndicator({ typers }: { typers: string[] | undefined }) {
  if (!typers || typers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      {typers.join(", ")} {typers.length > 1 ? "are" : "is"} typing...
    </div>
  );
}
