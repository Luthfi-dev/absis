
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockSchedule, type ScheduleItem, mockRoster, mockTeachers, type Teacher, type Roster, mockSubjects, mockClasses, type DelegatedTask } from "@/lib/mock-data"
import { CalendarClock, Clock, ScanLine, UserPlus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [activeSchedule, setActiveSchedule] = useState<ScheduleItem[]>([]);
  const [delegatedSchedule, setDelegatedSchedule] = useState<ScheduleItem[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>(mockTeachers);
  const [rosterData, setRosterData] = useState<Roster>({});
  
  useEffect(() => {
    // Load initial data
    const savedUsers = localStorage.getItem('mockTeachers');
    if (savedUsers) setAllTeachers(JSON.parse(savedUsers));
    else setAllTeachers(mockTeachers);
    
    const savedRoster = localStorage.getItem('mockRoster');
    if(savedRoster) setRosterData(JSON.parse(savedRoster));
    else setRosterData(require('@/lib/mock-data').mockRoster);
    
    const savedDelegations = localStorage.getItem('mockDelegations');
    const delegations: DelegatedTask[] = savedDelegations ? JSON.parse(savedDelegations) : [];

    if (!user) return;

    const getSchedules = () => {
      const now = new Date();
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currentDayName = dayNames[now.getDay()];
      const todayStr = now.toISOString().split('T')[0];

      const isTimeActive = (time: string) => {
        const [startTime, endTime] = time.split(' - ');
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date();
        endDate.setHours(endHours, endMinutes, 0, 0);

        return now >= startDate && now <= endDate;
      };

      // 1. Get Teacher's own active schedule
      const currentRosterData = JSON.parse(localStorage.getItem('mockRoster') || '{}');
      const currentTeachers = JSON.parse(localStorage.getItem('mockTeachers') || '[]');


      const ownActiveSchedules = Object.values(currentRosterData).flat()
        .filter((entry: any) => entry.teacherId === user.id && entry.day === currentDayName && isTimeActive(entry.time))
        .map((cs: any) => {
           const subject = mockSubjects.find(s => s.id === cs.subjectId)?.name || 'N/A';
           const className = mockClasses.find(c => Object.entries(currentRosterData).some(([classId, entries] : [string, any]) => classId === c.id && entries.some((e: any) => e.id === cs.id)))?.name || 'N/A';
           return {
              id: cs.id,
              time: cs.time,
              subject: subject,
              class: className,
              teacher: user.name, // It's their own schedule
              status: 'Sedang Berlangsung'
           } as ScheduleItem;
        });
      setActiveSchedule(ownActiveSchedules);

      // 2. Get active delegated tasks
      const activeDelegatedTasks = delegations
        .filter(d => d.substituteTeacherId === user.id && d.date === todayStr && isTimeActive(d.rosterEntry.time))
        .map(d => {
            const { rosterEntry } = d;
            const subject = mockSubjects.find(s => s.id === rosterEntry.subjectId)?.name || 'N/A';
            // Find class name from the main roster data
            const className = mockClasses.find(c => Object.entries(currentRosterData).some(([classId, entries]: [string, any]) => entries.some((e:any) => e.id === rosterEntry.id)))?.name || 'N/A';
            const originalTeacher = currentTeachers.find((t:any) => t.id === rosterEntry.teacherId)?.name || 'N/A';
            return {
                id: d.id, // Use delegation ID for uniqueness
                time: rosterEntry.time,
                subject: subject,
                class: className,
                teacher: `Menggantikan: ${originalTeacher}`,
                status: 'Sedang Berlangsung'
            } as ScheduleItem;
        });
      setDelegatedSchedule(activeDelegatedTasks);
    };

    getSchedules();
    const interval = setInterval(getSchedules, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const renderScheduleList = (items: ScheduleItem[], isDelegated = false) => (
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.subject}</p>
                {isDelegated && <Badge variant="warning">Tugas Tambahan</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{item.class}</p>
              <p className="text-sm text-muted-foreground">{item.time}</p>
              {isDelegated && <p className="text-xs text-muted-foreground italic">{item.teacher}</p>}
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
  )

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Guru</h1>
        <p className="text-muted-foreground">Selamat datang, {user?.name}! Berikut jadwal mengajar Anda saat ini.</p>
      </div>
      
      {delegatedSchedule.length > 0 && (
        <Card className="border-amber-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6 text-amber-600" />
                    Jadwal yang Dialihkan
                </CardTitle>
                <CardDescription>Jadwal tambahan yang dialihkan kepada Anda untuk hari ini.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderScheduleList(delegatedSchedule, true)}
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6" />
            Jadwal Mengajar Anda
          </CardTitle>
          <CardDescription>Pilih kelas untuk memulai sesi absensi.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSchedule.length > 0 ? (
            renderScheduleList(activeSchedule)
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Tidak ada jadwal mengajar untuk Anda saat ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
