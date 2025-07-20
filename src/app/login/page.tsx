'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckSquare, LogIn, User, Shield, UserPlus } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { mockTeachers, type Teacher } from "@/lib/mock-data"

type Role = "admin" | "teacher"
type AuthMode = "login" | "register"

export default function LoginPage() {
  const [role, setRole] = useState<Role>("admin")
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const router = useRouter()
  const { toast } = useToast()

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    if (authMode === "login") {
      // Login logic
      if (role === "admin") {
        router.push("/dashboard")
      } else {
        router.push("/teacher-dashboard")
      }
    } else {
      // Registration logic for teachers
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const nip = (form.elements.namedItem('nip') as HTMLInputElement).value;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;

      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name,
        nip,
        email
      };

      // In a real app, you would make an API call here.
      // For this mock, we'll update localStorage.
      const updatedTeachers = [...mockTeachers, newTeacher];
      // Note: This would need a more robust solution in a real app,
      // as localStorage doesn't persist across different mock data initializations.
      // For prototype purposes, this demonstrates the flow.
      console.log("New teacher registered:", newTeacher);
      console.log("Updated teacher list (conceptual):", updatedTeachers);

      toast({
        title: "Pendaftaran Berhasil",
        description: `Akun untuk ${name} telah dibuat. Silakan masuk.`,
      });

      setAuthMode("login"); // Switch back to login mode
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleAuthAction}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">{authMode === 'login' ? 'Selamat Datang!' : 'Buat Akun Guru'}</CardTitle>
            <CardDescription>{authMode === 'login' ? 'Silakan masuk untuk melanjutkan.' : 'Isi form untuk mendaftar.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {authMode === 'login' ? (
                <div className="space-y-3">
                     <Label>Pilih Peran Anda</Label>
                    <RadioGroup defaultValue="admin" value={role} onValueChange={(value: Role) => setRole(value)} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                            <Label
                            htmlFor="admin"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                            <Shield className="mb-3 h-6 w-6" />
                            Admin
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                            <Label
                            htmlFor="teacher"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                            <User className="mb-3 h-6 w-6" />
                            Guru
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" type="text" placeholder="cth. Bpk. Budi" required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="nip">NIP (Nomor Induk Pegawai)</Label>
                      <Input id="nip" type="text" placeholder="cth. G12345678" required />
                  </div>
                </>
              )}
              <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder={role === 'admin' ? "admin@example.com" : "guru@example.com"} required defaultValue={authMode === 'login' ? (role === 'admin' ? "admin@attendease.com" : "guru@attendease.com") : ""} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <Input id="password" type="password" required defaultValue={authMode === 'login' ? "password" : ""} />
              </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
                {authMode === 'login' ? <><LogIn className="mr-2 h-4 w-4" /> Masuk</> : <><UserPlus className="mr-2 h-4 w-4" /> Daftar</>}
            </Button>
            <div className="relative w-full flex items-center">
              <div className="flex-grow border-t border-muted"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground">ATAU</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            <Button variant="link" type="button" className="w-full" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? 'Belum punya akun? Daftar sebagai Guru' : 'Sudah punya akun? Masuk'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
