
'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockRoster, mockClasses, mockSubjects, mockTeachers, type Roster, type Teacher, type RosterEntry } from "@/lib/mock-data"
import { useAuth } from '@/hooks/use-auth';
import { Calendar } from 'lucide-react';

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function TeacherSchedulesPage() {
  const { user } = useAuth();
  const [rosterData, setRosterData] = useState<Roster>({});
  
  useEffect(() => {
    // In a real app, this would be a fetch call.
    // For now, we get it from mock data source which could be localStorage.
    const savedRoster = typeof window !== 'undefined' ? localStorage.getItem('mockRoster') : null;
    if (savedRoster) {
      setRosterData(JSON.parse(savedRoster));
    } else {
      const initialRoster = require('@/lib/mock-data').mockRoster;
      setRosterData(initialRoster);
    }
  }, []);

  const getSubjectName = (id: string) => mockSubjects.find(s => s.id === id)?.name || 'N/A';
  const getClassName = (id: string) => mockClasses.find(c => c.id === id)?.name || 'N/A';
  
  const teacherSchedulesByDay = daysOfWeek.map(day => {
    const entries: (RosterEntry & { className: string })[] = [];
    Object.entries(rosterData).forEach(([classId, classRoster]) => {
      const teacherEntries = classRoster.filter(entry => entry.teacherId === user?.id && entry.day === day);
      teacherEntries.forEach(entry => {
        entries.push({
          ...entry,
          className: getClassName(classId)
        });
      });
    });
    return {
      day,
      entries: entries.sort((a,b) => a.time.localeCompare(b.time))
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Jadwal Mengajar</h1>
        <p className="text-muted-foreground">Berikut adalah seluruh jadwal mengajar Anda untuk minggu ini.</p>
      </div>
      
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
                                    <p className="font-semibold">{getSubjectName(entry.subjectId)}</p>
                                    <p className="text-muted-foreground">{entry.className}</p>
                                    <p className="text-xs text-muted-foreground pt-1">{entry.time}</p>
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
  )
}
