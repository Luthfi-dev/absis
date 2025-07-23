
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
import { mockClasses, mockSubjects, mockTeachers, type Roster, type RosterEntry, type Teacher, type DelegatedTask, mockAttendance } from "@/lib/mock-data"
import { Button } from '@/components/ui/button'
import { Calendar, PlusCircle, MoreHorizontal, Edit, Trash2, Pilcrow } from 'lucide-react'
import { RosterEntryDialog } from '@/components/add-roster-entry-dialog'
import { DelegateTaskDialog } from '@/components/delegate-task-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast'


const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function RosterPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [rosterData, setRosterData] = useState<Roster>({});
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast();

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
    
    // Load teachers dynamically
    const savedUsers = typeof window !== 'undefined' ? localStorage.getItem('mockTeachers') : null;
    if (savedUsers) {
      setAllTeachers(JSON.parse(savedUsers));
    } else {
      setAllTeachers(mockTeachers);
    }
    
    const handleRosterUpdated = () => {
        const updatedRoster = localStorage.getItem('mockRoster');
        if (updatedRoster) {
            setRosterData(JSON.parse(updatedRoster));
        }
    };
    window.addEventListener('rosterUpdated', handleRosterUpdated);
    
    const handleUsersUpdated = () => {
        const updatedUsers = localStorage.getItem('mockTeachers');
        if (updatedUsers) {
            setAllTeachers(JSON.parse(updatedUsers));
        }
    };
    window.addEventListener('usersUpdated', handleUsersUpdated);


    return () => {
        window.removeEventListener('rosterUpdated', handleRosterUpdated);
        window.removeEventListener('usersUpdated', handleUsersUpdated);
    };
  }, []);

  const getSubjectName = (id: string) => mockSubjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string) => allTeachers.find(t => t.id === id)?.name || 'N/A';

  const selectedRoster = selectedClassId ? rosterData[selectedClassId] || [] : [];
  
  const rosterByDay = daysOfWeek.map(day => ({
    day,
    entries: selectedRoster.filter(entry => entry.day === day)
        .sort((a,b) => a.time.localeCompare(b.time))
  }));
  
  const updateRosterInStorage = (newRosterData: Roster) => {
    setRosterData(newRosterData);
    if(typeof window !== 'undefined') {
        localStorage.setItem('mockRoster', JSON.stringify(newRosterData));
        window.dispatchEvent(new Event('rosterUpdated'));
    }
  }

  const handleRosterSave = (entryToSave: RosterEntry) => {
    if (!selectedClassId) return;

    const updatedRoster = { ...rosterData };
    if (!updatedRoster[selectedClassId]) {
      updatedRoster[selectedClassId] = [];
    }
    
    const entryIndex = updatedRoster[selectedClassId].findIndex(e => e.id === entryToSave.id);
    if (entryIndex > -1) {
      // Edit mode
      updatedRoster[selectedClassId][entryIndex] = entryToSave;
    } else {
      // Add mode
      updatedRoster[selectedClassId].push(entryToSave);
    }
    
    updateRosterInStorage(updatedRoster);
  };
  
  const handleDeleteRoster = (entryId: string) => {
    if (!selectedClassId) return;

    // Check if attendance exists for this roster entry
    const attendanceExists = Object.values(mockAttendance).flat().some(rec => rec.rosterEntryId === entryId);
    if (attendanceExists) {
        toast({
            variant: "destructive",
            title: "Hapus Gagal",
            description: "Tidak dapat menghapus jadwal yang sudah memiliki catatan kehadiran.",
        });
        return;
    }
    
    const updatedRoster = { ...rosterData };
    updatedRoster[selectedClassId] = updatedRoster[selectedClassId].filter(e => e.id !== entryId);
    
    updateRosterInStorage(updatedRoster);
    toast({
        title: "Jadwal Dihapus",
        description: "Jadwal pelajaran telah berhasil dihapus.",
    });
  }

  const handleTaskDelegated = (delegation: DelegatedTask) => {
    const savedDelegations = localStorage.getItem('mockDelegations');
    const delegations: DelegatedTask[] = savedDelegations ? JSON.parse(savedDelegations) : [];
    delegations.push(delegation);
    localStorage.setItem('mockDelegations', JSON.stringify(delegations));
    window.dispatchEvent(new Event('delegationsUpdated'));
    toast({
      title: "Tugas Berhasil Dialihkan",
      description: `Jadwal telah dialihkan untuk tanggal yang dipilih.`,
    });
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
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
            <RosterEntryDialog 
                classId={selectedClassId} 
                onSave={handleRosterSave} 
                mode="add"
            >
                <Button disabled={!selectedClassId} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Atur Roster
                </Button>
            </RosterEntryDialog>
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
                             <RosterEntryDialog 
                                classId={selectedClassId}
                                day={day}
                                onSave={handleRosterSave}
                                mode="add"
                            >
                                <Button variant="ghost" size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                                </Button>
                            </RosterEntryDialog>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col pt-0">
                        {entries.length > 0 ? (
                            <ul className="space-y-4">
                                {entries.map(entry => (
                                    <li key={entry.id} className="p-3 bg-muted/50 rounded-lg text-sm relative group">
                                        <p className="font-semibold">{getSubjectName(entry.subjectId)}</p>
                                        <p className="text-muted-foreground">{getTeacherName(entry.teacherId)}</p>
                                        <p className="text-xs text-muted-foreground pt-1">{entry.time}</p>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <RosterEntryDialog
                                                        classId={selectedClassId}
                                                        entry={entry}
                                                        onSave={handleRosterSave}
                                                        mode="edit"
                                                    >
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Ubah</span>
                                                        </DropdownMenuItem>
                                                    </RosterEntryDialog>
                                                    <DelegateTaskDialog
                                                        rosterEntry={entry}
                                                        onTaskDelegated={handleTaskDelegated}
                                                    >
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Pilcrow className="mr-2 h-4 w-4" />
                                                            <span>Alihkan Tugas</span>
                                                        </DropdownMenuItem>
                                                    </DelegateTaskDialog>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Hapus</span>
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tindakan ini akan menghapus jadwal secara permanen. Anda tidak dapat menghapus jadwal jika sudah ada data absensi yang terkait.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteRoster(entry.id)}>
                                                                    Ya, Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                <p className="mb-4 text-sm">Belum ada jadwal untuk hari ini.</p>
                                 <RosterEntryDialog 
                                    classId={selectedClassId} 
                                    day={day}
                                    onSave={handleRosterSave} 
                                    mode="add"
                                >
                                     <Button variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Tambah Pelajaran
                                    </Button>
                                </RosterEntryDialog>
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
