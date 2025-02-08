import { currentUser } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppNavbar } from "@/components/layout/app-navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  const userRole = user?.publicMetadata?.role as string
  const userName = `${user?.username}`

  return (
    <SidebarProvider>
      <div className="relative flex w-full min-h-screen">
        <AppSidebar userRole={userRole} />
        <SidebarInset className="flex w-full flex-col">
          <AppNavbar userRole={userRole} userName={userName} />
          <main className="flex-1 bg-slate-100 overflow-auto">
           {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

