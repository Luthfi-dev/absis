
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  CheckSquare,
  Home,
  LogOut,
  Users,
  Settings,
  ClipboardCheck,
  CalendarDays,
  School,
  Book,
  Database,
  Users2,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { generateAvatarColor } from "@/lib/utils"

export function AppSidebar() {
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
    { href: "/dashboard", label: "Dasbor", icon: Home },
    { href: "/students", label: "Siswa", icon: Users },
    { href: "/roster", label: "Roster Kelas", icon: CalendarDays },
    { href: "/attendance", label: "Kehadiran", icon: ClipboardCheck },
    { href: "/users", label: "Manajemen Pengguna", icon: Users2 },
  ]
  
  const masterDataItems = [
    { href: "/master-data/classes", label: "Data Kelas", icon: School },
    { href: "/master-data/subjects", label: "Data Pelajaran", icon: Book },
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
                isActive={pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === '/dashboard'}
                icon={<item.icon />}
                tooltip={item.label}
                onClick={handleLinkClick}
              >
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
            <SidebarMenuItem>
                 <div className="px-2 text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Master Data</span>
                </div>
            </SidebarMenuItem>
           {masterDataItems.map((item) => (
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
        <SidebarSeparator />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton as={Link} href="/settings" isActive={pathname.startsWith('/settings')} icon={<Settings/>} tooltip="Pengaturan" onClick={handleLinkClick}>
                    Pengaturan
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
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
