
'use client'

import { Header } from "@/components/header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function TeacherLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <TeacherSidebar />
        <SidebarInset>
          <Header>
             <SidebarTrigger className="md:hidden" />
          </Header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <TeacherLayoutContent>{children}</TeacherLayoutContent>
    </AuthProvider>
  );
}
