'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockSchedule, type ScheduleItem } from "@/lib/mock-data"
import { CalendarClock, Clock, ScanLine } from "lucide-react"
import Link from "next/link"

function getStatusVariant(status: ScheduleItem['status']) {
  switch (status) {
    case 'Sedang Berlangsung':
      return 'default'
    case 'Selesai':
      return 'secondary'
    case 'Akan Datang':
      return 'outline'
    default:
      return 'default'
  }
}

export default function TeacherDashboardPage() {
  // In a real app, this would be filtered by the logged-in teacher's ID
  const teacherSchedule = mockSchedule.filter(item => item.teacher === 'Bpk. Smith');

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Guru</h1>
        <p className="text-muted-foreground">Selamat datang, Bpk. Smith! Berikut jadwal mengajar Anda hari ini.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6" />
            Jadwal Mengajar Hari Ini
          </CardTitle>
          <CardDescription>Pilih kelas untuk memulai sesi absensi.</CardDescription>
        </CardHeader>
        <CardContent>
          {teacherSchedule.length > 0 ? (
            <ul className="space-y-4">
              {teacherSchedule.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.subject}</p>
                       <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.class}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <Button asChild disabled={item.status !== 'Sedang Berlangsung'}>
                    <Link href={`/attendance/${item.id}`}>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Mulai Absensi
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Tidak ada jadwal mengajar untuk Anda hari ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
