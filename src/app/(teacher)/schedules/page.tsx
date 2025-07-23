
'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockRoster, mockClasses, mockSubjects, type Roster, type RosterEntry, mockAttendance, type DelegatedTask } from "@/lib/mock-data"
import { useAuth } from '@/hooks/use-auth';
import { Calendar, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function TeacherSchedulesPage() {
  const { user } = useAuth();
  const [rosterData, setRosterData] = useState<Roster>({});
  const [delegations, setDelegations] = useState<DelegatedTask[]>([]);
  
  useEffect(() => {
    const savedRoster = localStorage.getItem('mockRoster');
    if (savedRoster) setRosterData(JSON.parse(savedRoster));
    else setRosterData(require('@/lib/mock-data').mockRoster);

    const savedDelegations = localStorage.getItem('mockDelegations');
    if (savedDelegations) setDelegations(JSON.parse(savedDelegations));

     const handleDelegationsUpdated = () => {
        const updatedDelegations = localStorage.getItem('mockDelegations');
        if (updatedDelegations) setDelegations(JSON.parse(updatedDelegations));
    };
    window.addEventListener('delegationsUpdated', handleDelegationsUpdated);
    
    return () => {
        window.removeEventListener('delegationsUpdated', handleDelegationsUpdated);
    };
  }, []);

  const getSubjectName = (id: string) => mockSubjects.find(s => s.id === id)?.name || 'N/A';
  const getClassName = (id: string) => mockClasses.find(c => c.id === id)?.name || 'N/A';
  const getTeacherName = (id: string) => require('@/lib/mock-data').mockTeachers.find(t => t.id === id)?.name || 'N/A';
  
  // This is a simplified check. A real app would check attendance records for that specific date and class.
  const hasAttendanceBeenTaken = (rosterEntryId: string) => {
    return Object.values(mockAttendance).flat().some(rec => rec.rosterEntryId === rosterEntryId);
  }

  const teacherSchedulesByDay = daysOfWeek.map(day => {
    const entries: (RosterEntry & { className: string; status: 'attended' | 'missed' })[] = [];
    Object.entries(rosterData).forEach(([classId, classRoster]) => {
      const teacherEntries = classRoster.filter(entry => entry.teacherId === user?.id && entry.day === day);
      teacherEntries.forEach(entry => {
        entries.push({
          ...entry,
          className: getClassName(classId),
          status: hasAttendanceBeenTaken(entry.id) ? 'attended' : 'missed',
        });
      });
    });
    return {
      day,
      entries: entries.sort((a,b) => a.time.localeCompare(b.time))
    };
  });
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const delegatedTasksReceived = delegations.filter(d => d.substituteTeacherId === user?.id && d.date === todayStr);
  const delegatedTasksGiven = delegations.filter(d => d.originalTeacherId === user?.id && d.date === todayStr);

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Jadwal & Riwayat</h1>
        <p className="text-muted-foreground">Jadwal mengajar tetap Anda, beserta riwayat pengalihan tugas.</p>
      </div>

      {(delegatedTasksReceived.length > 0 || delegatedTasksGiven.length > 0) && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6"/>
                    Riwayat Pengalihan Tugas Hari Ini
                </CardTitle>
                <CardDescription>Catatan tugas yang dialihkan, baik yang Anda terima maupun yang Anda berikan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {delegatedTasksReceived.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Tugas yang Diterima:</h4>
                        <ul className="space-y-2">
                            {delegatedTasksReceived.map(d => (
                                <li key={d.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                    <p><span className="font-semibold">{getSubjectName(d.rosterEntry.subjectId)}</span> ({d.rosterEntry.time})</p>
                                    <p className="text-muted-foreground">Menggantikan: {getTeacherName(d.originalTeacherId)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {delegatedTasksGiven.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Tugas yang Diberikan:</h4>
                         <ul className="space-y-2">
                            {delegatedTasksGiven.map(d => (
                                <li key={d.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm">
                                    <p><span className="font-semibold">{getSubjectName(d.rosterEntry.subjectId)}</span> ({d.rosterEntry.time})</p>
                                    <p className="text-muted-foreground">Digantikan oleh: {getTeacherName(d.substituteTeacherId)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
         <h2 className="text-2xl font-bold tracking-tight">Jadwal Mengajar Tetap</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {teacherSchedulesByDay.map(({ day, entries }) => (
                <Card key={day} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {day}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col pt-0">
                        {entries.length > 0 ? (
                            <ul className="space-y-4">
                                {entries.map(entry => (
                                    <li key={entry.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{getSubjectName(entry.subjectId)}</p>
                                                <p className="text-muted-foreground">{entry.className}</p>
                                                <p className="text-xs text-muted-foreground pt-1">{entry.time}</p>
                                            </div>
                                            {entry.status === 'attended' ? (
                                                <Badge variant="success" className="flex-shrink-0">
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Hadir
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="flex-shrink-0">
                                                     <XCircle className="mr-1 h-3 w-3" /> Alpa
                                                </Badge>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                <p className="text-sm">Tidak ada jadwal untuk hari ini.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
         </div>
      </div>
    </>
  )
}
