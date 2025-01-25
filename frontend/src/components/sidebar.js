"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ListTodo, Calendar, Settings, PlusCircle } from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/user/projects", icon: ListTodo },
  { name: "Calendar", href: "/user/calendar", icon: Calendar },
  { name: "Settings", href: "/user/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col justify-between border-r bg-gray-100/40 p-4 w-64">
      <div className="space-y-4">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">ProjectHub</h2>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href ? "bg-gray-200/80 hover:bg-gray-200/80" : "hover:bg-gray-200/50",
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <Button className="w-full justify-start" asChild>
        <Link href="/user/projects/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </Button>
    </div>
  )
}

