import { UserButton } from "@clerk/nextjs"
import { Bell, MessageCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "../ui/sidebar"

interface AppNavbarProps {
  userRole: string
  userName: string
}

export function AppNavbar({ userRole, userName }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 flex h-[3.23rem] items-center justify-between">
      <SidebarTrigger className="mr-1 block sm:hidden -ml-2" />
        <div className="hidden md:flex">
        <SidebarTrigger className="mr-1 -ml-2" />
          <div className="relative ">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="w-[200px] pl-8" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0">1</Badge>
          </Button>
          <div className="flex flex-col items-end">
            <span className="text-sm capitalize font-medium">{userName}</span>
            {/* <Badge variant={"secondary"} className="text-xs ">{userRole}</Badge> */}
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  )
}

