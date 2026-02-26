export function ChatEmptyState() {
  return (
    <div className="flex-1 h-full hidden md:flex items-center justify-center text-muted-foreground bg-muted/10">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome to your Chat</h2>
        <p>Select a conversation from the sidebar to start messaging.</p>
      </div>
    </div>
  );
}
