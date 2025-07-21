
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockSchedule, type ScheduleItem } from "@/lib/mock-data"
import { CalendarClock, Clock, ScanLine } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function TeacherDashboardPage() {
  const [activeSchedule, setActiveSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const getActiveSchedule = () => {
      const now = new Date();
      // In a real app, this would be filtered by the logged-in teacher's ID
      const teacherSchedule = mockSchedule.filter(item => item.teacher === 'Bpk. Smith');

      const currentSchedule = teacherSchedule.filter(item => {
        const [startTime, endTime] = item.time.split(' - ');
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date();
        endDate.setHours(endHours, endMinutes, 0, 0);

        return now >= startDate && now <= endDate;
      });
      
      setActiveSchedule(currentSchedule);
    };

    getActiveSchedule();
    const interval = setInterval(getActiveSchedule, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Guru</h1>
        <p className="text-muted-foreground">Selamat datang, Bpk. Smith! Berikut jadwal mengajar Anda saat ini.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6" />
            Jadwal Mengajar Saat Ini
          </CardTitle>
          <CardDescription>Pilih kelas untuk memulai sesi absensi.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSchedule.length > 0 ? (
            <ul className="space-y-4">
              {activeSchedule.map((item) => (
                <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.subject}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.class}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
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
              <p>Tidak ada jadwal mengajar untuk Anda saat ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
