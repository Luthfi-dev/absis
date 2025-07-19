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
import { CheckSquare, LogIn } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@example.com" defaultValue="admin@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" defaultValue="password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <LogIn className="mr-2 h-4 w-4" /> Masuk
            </Link>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Gunakan email dan kata sandi apa pun untuk melanjutkan.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
