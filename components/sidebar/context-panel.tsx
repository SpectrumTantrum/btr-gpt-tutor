"use client";

import { usePathname } from "next/navigation";
import { ContextPanelSection } from "./context-panel-section";
import { SessionsList } from "./sessions-list";
import { KnowledgeList } from "./knowledge-list";
import { ClassroomsList } from "./classrooms-list";

export function ContextPanel() {
  const pathname = usePathname();
  const content = renderContent(pathname);

  return (
    <aside
      aria-label="Section context"
      className="hidden h-screen w-60 shrink-0 border-r border-[color:var(--context-panel-border)] bg-[color:var(--context-panel)] md:block"
    >
      {content}
    </aside>
  );
}

function renderContent(pathname: string): React.ReactNode {
  if (pathname === "/" || pathname === "") return <HomeSection />;
  if (pathname.startsWith("/chat")) return <ChatSection />;
  if (pathname.startsWith("/classroom")) return <ClassroomSection />;
  if (pathname.startsWith("/knowledge")) return <KnowledgeSection />;
  if (pathname.startsWith("/co-writer")) return <CoWriterSection />;
  if (pathname.startsWith("/guide")) return <GuideSection />;
  if (pathname.startsWith("/notebook")) return <NotebookSection />;
  if (pathname.startsWith("/tutorbot")) return <TutorBotSection />;
  if (pathname.startsWith("/settings")) return <SettingsSection />;
  return <HomeSection />;
}

function HomeSection() {
  return (
    <ContextPanelSection title="Home">
      <p className="px-2 py-3 text-xs text-muted-foreground">Welcome back.</p>
    </ContextPanelSection>
  );
}

function ChatSection() {
  return (
    <ContextPanelSection title="Chat" onCreate={() => { window.location.href = "/chat"; }}>
      <SessionsList />
    </ContextPanelSection>
  );
}

function ClassroomSection() {
  return (
    <ContextPanelSection title="Classroom" onCreate={() => { window.location.href = "/classroom"; }}>
      <ClassroomsList />
    </ContextPanelSection>
  );
}

function KnowledgeSection() {
  return (
    <ContextPanelSection title="Knowledge" onCreate={() => { window.location.href = "/knowledge"; }}>
      <KnowledgeList />
    </ContextPanelSection>
  );
}

function CoWriterSection() {
  return (
    <ContextPanelSection title="Co-Writer">
      <div className="px-2 py-3 text-xs text-muted-foreground">No drafts yet.</div>
    </ContextPanelSection>
  );
}

function GuideSection() {
  return (
    <ContextPanelSection title="Guide">
      <div className="px-2 py-3 text-xs text-muted-foreground">No guided plans.</div>
    </ContextPanelSection>
  );
}

function NotebookSection() {
  return (
    <ContextPanelSection title="Notebook">
      <div className="px-2 py-3 text-xs text-muted-foreground">No notebooks.</div>
    </ContextPanelSection>
  );
}

function TutorBotSection() {
  return (
    <ContextPanelSection title="TutorBot">
      <div className="px-2 py-3 text-xs text-muted-foreground">No bots.</div>
    </ContextPanelSection>
  );
}

function SettingsSection() {
  return (
    <ContextPanelSection title="Settings">
      <div className="px-2 py-3 text-xs text-muted-foreground">
        Configure providers, theme, language.
      </div>
    </ContextPanelSection>
  );
}
