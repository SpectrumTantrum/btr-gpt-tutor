export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r border-border bg-muted/30 p-4">
        <h1 className="text-lg font-bold">btr-gpt-tutor</h1>
        <nav className="mt-6 space-y-1">
          <a href="/" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Home</a>
          <a href="/chat" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Chat</a>
          <a href="/knowledge" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Knowledge</a>
          <a href="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
