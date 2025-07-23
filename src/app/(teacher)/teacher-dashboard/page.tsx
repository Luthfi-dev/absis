
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockRoster, mockTeachers, type Teacher, type Roster, mockSubjects, mockClasses, type DelegatedTask } from "@/lib/mock-data"
import { CalendarClock, Clock, ScanLine, UserPlus, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

type ScheduleStatus = 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai' | 'Dialihkan';

type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  class: string;
  teacher: string;
  status: ScheduleStatus;
  isDelegated?: boolean;
  delegatedTo?: string;
};


const getStatusForSchedule = (time: string): Omit<ScheduleStatus, 'Dialihkan'> => {
    const now = new Date();
    const [startTimeStr, endTimeStr] = time.split(' - ');
    
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const startDate = new Date(now);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    const endDate = new Date(now);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (now < startDate) return 'Akan Datang';
    if (now >= startDate && now <= endDate) return 'Sedang Berlangsung';
    return 'Selesai';
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [delegatedSchedule, setDelegatedSchedule] = useState<ScheduleItem[]>([]);
  
  useEffect(() => {
    if (!user) return;

    const getSchedules = () => {
      const now = new Date();
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currentDayName = dayNames[now.getDay()];
      const todayStr = now.toISOString().split('T')[0];
      
      const currentRosterData: Roster = JSON.parse(localStorage.getItem('mockRoster') || JSON.stringify(mockRoster));
      const currentTeachers: Teacher[] = JSON.parse(localStorage.getItem('mockTeachers') || JSON.stringify(mockTeachers));
      const savedDelegations = localStorage.getItem('mockDelegations');
      const delegations: DelegatedTask[] = savedDelegations ? JSON.parse(savedDelegations) : [];


      // 1. Get Teacher's own schedule for today
      const ownSchedules = Object.values(currentRosterData).flat()
        .filter((entry: any) => entry.teacherId === user.id && entry.day === currentDayName)
        .map((cs: any) => {
           const subject = mockSubjects.find(s => s.id === cs.subjectId)?.name || 'N/A';
           const className = mockClasses.find(c => Object.entries(currentRosterData).some(([classId, entries] : [string, any]) => classId === c.id && entries.some((e: any) => e.id === cs.id)))?.name || 'N/A';
           
           const todaysDelegation = delegations.find(d => d.rosterEntryId === cs.id && d.date === todayStr && d.originalTeacherId === user.id);

           if (todaysDelegation) {
               const substituteTeacher = currentTeachers.find(t => t.id === todaysDelegation.substituteTeacherId)?.name || 'N/A';
               return {
                  id: cs.id,
                  time: cs.time,
                  subject: subject,
                  class: className,
                  teacher: user.name,
                  status: 'Dialihkan',
                  isDelegated: true,
                  delegatedTo: substituteTeacher
               } as ScheduleItem;
           }
           
           return {
              id: cs.id,
              time: cs.time,
              subject: subject,
              class: className,
              teacher: user.name,
              status: getStatusForSchedule(cs.time)
           } as ScheduleItem;
        });
      setTodaysSchedule(ownSchedules);

      // 2. Get delegated tasks received by the user for today
      const todaysDelegatedTasks = delegations
        .filter(d => d.substituteTeacherId === user.id && d.date === todayStr)
        .map(d => {
            const { rosterEntry } = d;
            const subject = mockSubjects.find(s => s.id === rosterEntry.subjectId)?.name || 'N/A';
            const className = mockClasses.find(c => Object.entries(currentRosterData).some(([classId, entries]: [string, any]) => entries.some((e:any) => e.id === rosterEntry.id)))?.name || 'N/A';
            const originalTeacher = currentTeachers.find((t:any) => t.id === rosterEntry.teacherId)?.name || 'N/A';
            return {
                id: d.id, // Use delegation ID for uniqueness
                time: rosterEntry.time,
                subject: subject,
                class: className,
                teacher: `Menggantikan: ${originalTeacher}`,
                status: getStatusForSchedule(rosterEntry.time)
            } as ScheduleItem;
        });
      setDelegatedSchedule(todaysDelegatedTasks);
    };

    getSchedules();
    const interval = setInterval(getSchedules, 60000); // Check every minute to update status

    return () => clearInterval(interval);
  }, [user]);

  const getStatusVariant = (status: ScheduleStatus) => {
    switch(status) {
        case 'Sedang Berlangsung': return 'success';
        case 'Akan Datang': return 'outline';
        case 'Selesai': return 'secondary';
        case 'Dialihkan': return 'warning';
        default: return 'default';
    }
  }

  const renderScheduleList = (items: ScheduleItem[], isReceivedDelegation = false) => (
      <ul className="space-y-4">
        {items.sort((a,b) => a.time.localeCompare(b.time)).map((item) => (
          <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.subject}</p>
                 <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.class}</p>
              <p className="text-sm text-muted-foreground">{item.time}</p>
              {isReceivedDelegation && <p className="text-xs text-muted-foreground italic">{item.teacher}</p>}
            </div>
            {item.status === 'Sedang Berlangsung' && (
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/attendance/${item.id}`}>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Mulai Absensi
                </Link>
              </Button>
            )}
            {item.status === 'Dialihkan' && (
                 <div className="text-xs sm:text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md flex items-center gap-2 w-full sm:w-auto justify-center">
                    <ArrowRightLeft className="h-4 w-4 flex-shrink-0"/>
                    <span>Dialihkan ke {item.delegatedTo}</span>
                 </div>
            )}
          </li>
        ))}
      </ul>
  )

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Guru</h1>
        <p className="text-muted-foreground">Selamat datang, {user?.name}! Berikut jadwal mengajar Anda untuk hari ini.</p>
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
            Jadwal Mengajar Anda Hari Ini
          </CardTitle>
          <CardDescription>Tombol absensi akan aktif saat jadwal sedang berlangsung.</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysSchedule.length > 0 ? (
            renderScheduleList(todaysSchedule)
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Tidak ada jadwal mengajar untuk Anda hari ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
