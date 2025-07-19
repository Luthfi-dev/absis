'use client'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  CheckSquare,
  Home,
  LogOut,
  Users,
  Database,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/dashboard", label: "Dasbor", icon: Home },
    { href: "/students", label: "Siswa", icon: Users },
    { href: "/master-data", label: "Master Data", icon: Database },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <CheckSquare className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">AttendEase</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={pathname.startsWith(item.href)}
                icon={<item.icon />}
                tooltip={item.label}
              >
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src="https://i.pravatar.cc/150?u=superadmin" alt="Admin" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-sidebar-foreground">Super Admin</span>
            <span className="text-xs text-muted-foreground">superadmin@attendease.com</span>
          </div>
        </div>
         <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground">
            <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
            </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
