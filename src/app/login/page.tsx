
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
import { CheckSquare, LogIn, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { mockTeachers, type Teacher } from "@/lib/mock-data"
import { useAuth } from "@/hooks/use-auth"

type AuthMode = "login" | "register"

const getTeachersFromStorage = (): Teacher[] => {
    if (typeof window === 'undefined') return mockTeachers;
    const saved = localStorage.getItem('mockTeachers');
    if (!saved) {
      localStorage.setItem('mockTeachers', JSON.stringify(mockTeachers));
      return mockTeachers;
    }
    try {
        return JSON.parse(saved);
    } catch {
        localStorage.setItem('mockTeachers', JSON.stringify(mockTeachers));
        return mockTeachers;
    }
}

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const router = useRouter()
  const { toast } = useToast()
  const { user, login } = useAuth()

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.replace("/dashboard");
      } else if (user.role === 'teacher') {
        router.replace("/teacher-dashboard");
      }
    }
  }, [user, router]);

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.toLowerCase();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    const currentUsers = getTeachersFromStorage();

    if (authMode === "login") {
      const foundUser = currentUsers.find(u => u.email.toLowerCase() === email && u.password === password);

      if (foundUser) {
          if (foundUser.status !== 'active') {
              toast({
                  variant: "destructive",
                  title: "Login Gagal",
                  description: "Akun Anda masih menunggu persetujuan admin.",
              });
              return;
          }
          login(foundUser); // Save session
      } else {
          toast({
              variant: "destructive",
              title: "Login Gagal",
              description: "Email atau kata sandi salah.",
          });
      }
    } else { // Register mode
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const nip = (form.elements.namedItem('nip') as HTMLInputElement).value;
      const registerPassword = (form.elements.namedItem('password') as HTMLInputElement).value;

      // Validation for duplicate email
      if (currentUsers.some(u => u.email.toLowerCase() === email)) {
        toast({
            variant: "destructive",
            title: "Pendaftaran Gagal",
            description: "Email ini sudah terdaftar. Silakan gunakan email lain.",
        });
        return;
      }
      
      // Validation for duplicate NIP
      if (currentUsers.some(u => u.nip === nip)) {
        toast({
            variant: "destructive",
            title: "Pendaftaran Gagal",
            description: "NIP ini sudah terdaftar.",
        });
        return;
      }

      const newUser: Teacher = {
        id: `t-${Date.now()}`,
        name,
        nip,
        email,
        password: registerPassword,
        status: 'pending',
        role: 'teacher' // All new registrations are teachers by default
      };

      const updatedUsers = [...currentUsers, newUser];
      localStorage.setItem('mockTeachers', JSON.stringify(updatedUsers));
      
      window.dispatchEvent(new Event('usersUpdated'));

      toast({
        title: "Pendaftaran Berhasil",
        description: `Akun untuk ${name} telah dibuat dan menunggu persetujuan admin.`,
      });

      setAuthMode("login");
    }
  }

  if (user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleAuthAction}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">{authMode === 'login' ? 'Selamat Datang!' : 'Buat Akun Baru'}</CardTitle>
            <CardDescription>{authMode === 'login' ? 'Silakan masuk untuk melanjutkan.' : 'Isi form untuk mendaftar sebagai guru.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {authMode === 'register' && (
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
                  <Input id="email" type="email" placeholder="email@example.com" required defaultValue="superadmin@gmail.com" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <Input id="password" type="password" required defaultValue="123456" />
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
