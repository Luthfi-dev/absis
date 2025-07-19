'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockClasses, mockRoster, mockSubjects, mockTeachers, type Roster, type RosterEntry } from "@/lib/mock-data"
import { Button } from '@/components/ui/button'
import { Calendar, PlusCircle } from 'lucide-react'

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function RosterPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const getSubjectName = (id: string) => mockSubjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string) => mockTeachers.find(t => t.id === id)?.name || 'N/A';

  const selectedRoster = selectedClassId ? mockRoster[selectedClassId] || [] : [];
  
  const rosterByDay = daysOfWeek.map(day => ({
    day,
    entries: selectedRoster.filter(entry => entry.day === day)
        .sort((a,b) => a.time.localeCompare(b.time))
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Roster Kelas</h1>
            <p className="text-muted-foreground">Atur dan lihat jadwal pelajaran mingguan untuk setiap kelas.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Pilih kelas untuk dilihat..." />
              </SelectTrigger>
              <SelectContent>
                {mockClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button disabled={!selectedClassId}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Atur Roster
            </Button>
        </div>
      </div>
      
      {selectedClassId ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {rosterByDay.map(({ day, entries }) => (
                <Card key={day} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Calendar className="h-5 w-5 text-primary" />
                           {day}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {entries.length > 0 ? (
                            <ul className="space-y-4">
                                {entries.map(entry => (
                                    <li key={entry.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                                        <p className="font-semibold">{getSubjectName(entry.subjectId)}</p>
                                        <p className="text-muted-foreground">{getTeacherName(entry.teacherId)}</p>
                                        <p className="text-xs text-muted-foreground pt-1">{entry.time}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
                                <p>Tidak ada jadwal untuk hari ini.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
            <div className="text-center">
                <h3 className="text-xl font-semibold">Pilih Kelas</h3>
                <p className="text-muted-foreground mt-2">Silakan pilih kelas dari menu dropdown di atas untuk melihat rosternya.</p>
            </div>
        </Card>
      )}
    </div>
  )
}
