"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ListTodo, UserPen, LogOut, PlusCircle, Compass } from "lucide-react"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"

const sidebarItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: ListTodo },
  { name: "Explore", href: "/admin/explore", icon: Compass },
  { name: "Users", href: "/admin/users-manage", icon: UserPen}
]

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast()
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user')
    toast({
      title: "Logout",
      description: "Logged out successfully",
    })
    router.push('/login')
  }

  return (
    <div className="flex h-full flex-col justify-between border-r bg-white md:bg-gray-100/40 p-4 w-64">
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
        <Button className="w-full justify-start pt-0" variant="ghost" onClick={handleLogout} >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
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
