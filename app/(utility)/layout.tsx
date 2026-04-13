import { SidebarNav } from "@/components/sidebar/sidebar-nav"

export default function UtilityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
