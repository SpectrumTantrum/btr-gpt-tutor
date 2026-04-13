import { GuidePlanner } from "@/components/guide/guide-planner"
import { GuideNav } from "@/components/guide/guide-nav"
import { GuidePageViewer } from "@/components/guide/guide-page-viewer"

export default function GuidePage() {
  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 border-r border-border p-4 overflow-y-auto">
        <GuideNav />
      </aside>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <GuidePlanner />
        <GuidePageViewer />
      </main>
    </div>
  )
}
