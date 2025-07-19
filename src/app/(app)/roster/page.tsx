'use client'

import { useState, useEffect } from 'react'
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
import { mockClasses, mockSubjects, mockTeachers, type Roster, type RosterEntry } from "@/lib/mock-data"
import { Button } from '@/components/ui/button'
import { Calendar, PlusCircle } from 'lucide-react'
import { AddRosterEntryDialog } from '@/components/add-roster-entry-dialog'

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function RosterPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [rosterData, setRosterData] = useState<Roster>({});

  useEffect(() => {
    // Load initial data or from localStorage
    const savedRoster = typeof window !== 'undefined' ? localStorage.getItem('mockRoster') : null;
    if (savedRoster) {
      setRosterData(JSON.parse(savedRoster));
    } else {
      const initialRoster = require('@/lib/mock-data').mockRoster;
      setRosterData(initialRoster);
      if(typeof window !== 'undefined') {
        localStorage.setItem('mockRoster', JSON.stringify(initialRoster));
      }
    }
    
    const handleRosterUpdated = () => {
        const updatedRoster = localStorage.getItem('mockRoster');
        if (updatedRoster) {
            setRosterData(JSON.parse(updatedRoster));
        }
    };
    window.addEventListener('rosterUpdated', handleRosterUpdated);
    return () => {
        window.removeEventListener('rosterUpdated', handleRosterUpdated);
    };
  }, []);

  const getSubjectName = (id: string) => mockSubjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string) => mockTeachers.find(t => t.id === id)?.name || 'N/A';

  const selectedRoster = selectedClassId ? rosterData[selectedClassId] || [] : [];
  
  const rosterByDay = daysOfWeek.map(day => ({
    day,
    entries: selectedRoster.filter(entry => entry.day === day)
        .sort((a,b) => a.time.localeCompare(b.time))
  }));

  const handleRosterAdded = (newEntry: RosterEntry) => {
    if (!selectedClassId) return;

    const updatedRoster = { ...rosterData };
    if (!updatedRoster[selectedClassId]) {
      updatedRoster[selectedClassId] = [];
    }
    updatedRoster[selectedClassId].push(newEntry);
    
    setRosterData(updatedRoster);
    if(typeof window !== 'undefined') {
        localStorage.setItem('mockRoster', JSON.stringify(updatedRoster));
        window.dispatchEvent(new Event('rosterUpdated'));
    }
  };


  return (
    <div className="space-y-8">
      <div className="md:flex md:justify-between md:items-start space-y-4 md:space-y-0">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Roster Kelas</h1>
            <p className="text-muted-foreground">Atur dan lihat jadwal pelajaran mingguan untuk setiap kelas.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Select onValueChange={setSelectedClassId} value={selectedClassId || ''}>
              <SelectTrigger className="w-full sm:w-[280px]">
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
             <AddRosterEntryDialog 
                classId={selectedClassId} 
                onRosterAdded={handleRosterAdded} 
                triggerButton={
                    <Button disabled={!selectedClassId} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Atur Roster
                    </Button>
                }
            />
        </div>
      </div>
      
      {selectedClassId ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {rosterByDay.map(({ day, entries }) => (
                <Card key={day} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                               <Calendar className="h-5 w-5 text-primary" />
                               {day}
                            </CardTitle>
                            <AddRosterEntryDialog 
                                classId={selectedClassId}
                                day={day} 
                                onRosterAdded={handleRosterAdded}
                                triggerButton={
                                    <Button variant="ghost" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                                    </Button>
                                }
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col pt-0">
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
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                <p className="mb-4 text-sm">Belum ada jadwal untuk hari ini.</p>
                                <AddRosterEntryDialog 
                                    classId={selectedClassId} 
                                    day={day}
                                    onRosterAdded={handleRosterAdded} 
                                    triggerButton={
                                        <Button variant="outline" size="sm">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Tambah Pelajaran
                                        </Button>
                                    }
                                />
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
