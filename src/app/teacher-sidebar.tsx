
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
  useSidebar
} from "@/components/ui/sidebar"
import {
  CheckSquare,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function TeacherSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const menuItems = [
    { href: "/teacher-dashboard", label: "Dasbor", icon: LayoutDashboard },
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
                onClick={handleLinkClick}
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
            <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=teacher`} alt="Guru" />
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-sidebar-foreground">Bpk. Smith</span>
            <span className="text-xs text-muted-foreground">guru@attendease.com</span>
          </div>
        </div>
         <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground">
            <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
            </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
