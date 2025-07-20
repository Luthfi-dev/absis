
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
import { CheckSquare, LogIn, ScanLine } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">AttendEase</CardTitle>
            <CardDescription>Selamat datang di sistem absensi digital. Silakan pilih aksi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" className="w-full" asChild>
                <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Masuk Staf / Guru
                </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/scan">
                  <ScanLine className="mr-2 h-4 w-4" /> Buka Halaman Absensi
              </Link>
            </Button>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">Sistem pelacakan kehadiran yang efisien untuk sekolah modern.</p>
           </CardFooter>
      </Card>
    </div>
  )
}
