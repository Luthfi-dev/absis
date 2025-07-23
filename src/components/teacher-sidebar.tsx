
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
  Calendar,
  BarChart,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { generateAvatarColor } from "@/lib/utils"

export function TeacherSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLinkClick = () => {
    setOpenMobile(false);
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const menuItems = [
    { href: "/teacher-dashboard", label: "Dasbor", icon: LayoutDashboard },
    { href: "/schedules", label: "Jadwal Mengajar", icon: Calendar },
    { href: "/reports", label: "Laporan", icon: BarChart },
    { href: "/rankings", label: "Peringkat Kehadiran", icon: Crown },
  ]
  
  if (!user) return null;

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
                isActive={pathname === item.href || (item.href !== "/teacher-dashboard" && pathname.startsWith(item.href))}
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
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback style={{ backgroundColor: generateAvatarColor(user.name) }}>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-sidebar-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
         <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
