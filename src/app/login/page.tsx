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
import { CheckSquare, LogIn, User, Shield } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "teacher"

export default function LoginPage() {
  const [role, setRole] = useState<Role>("admin")
  const router = useRouter()

  const handleLogin = () => {
    if (role === "admin") {
      router.push("/dashboard")
    } else {
      router.push("/teacher-dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold">AttendEase</CardTitle>
          <CardDescription>Selamat datang! Silakan masuk untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder={role === 'admin' ? "admin@example.com" : "guru@example.com"} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input id="password" type="password" />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" /> Masuk
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Gunakan email dan kata sandi apa pun untuk melanjutkan.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
