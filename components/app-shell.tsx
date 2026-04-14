import { IconRail } from "@/components/sidebar/icon-rail";
import { ContextPanel } from "@/components/sidebar/context-panel";

interface AppShellProps {
  readonly children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <IconRail />
      <ContextPanel />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
