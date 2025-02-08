"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Home,
  Users,
  GraduationCap,
  UserSquare2,
  BookOpen,
  School,
  BookMarked,
  GanttChartSquare,
  ClipboardList,
  Award,
  CalendarCheck2,
  Calendar,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  TypeIcon as type,
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
  visible: string[]
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuItems: MenuGroup[] = [
  {
    title: "MENU",
    items: [
      {
        icon: Home,
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Users,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: GraduationCap,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: UserSquare2,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookOpen,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: School,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookMarked,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: GanttChartSquare,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: ClipboardList,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Award,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: CalendarCheck2,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Calendar,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: MessageSquare,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Bell,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
]

const footerItems: MenuItem[] = [
  {
    icon: UserCircle,
    label: "Profile",
    href: "/profile",
    visible: ["admin", "teacher", "student", "parent"],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    visible: ["admin", "teacher", "student", "parent"],
  },
  {
    icon: LogOut,
    label: "Logout",
    href: "/logout",
    visible: ["admin", "teacher", "student", "parent"],
  },
]

interface AppSidebarProps {
  userRole: string
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-background shadow-lg">
      <SidebarHeader className="border-b p-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="EduConnect" width={32} height={32} className="object-cover h-5 w-5" />
          <span className="font-bold text-xl hidden lg:block">EduConnect</span>
          <SidebarTrigger className="-ml-1" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-neutral-700 dark:scrollbar-thumb-neutral-500   [&::-webkit-scrollbar]:w-[0.4rem]
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.visible.includes(userRole)) {
                    const isActive = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                            <span className="hidden lg:block">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {footerItems.map((item) => {
            if (item.visible.includes(userRole)) {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                      <span className="hidden lg:block">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
          })}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

