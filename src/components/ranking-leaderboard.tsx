
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockStudents, mockAttendance, mockClasses, Student } from '@/lib/mock-data';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Crown, Medal } from 'lucide-react';
import { generateAvatarColor } from '@/lib/utils';

type TimeRange = 'today' | 'week' | 'month';
type Scope = 'all' | string; // 'all' for overall, or classId for specific class

type RankingData = {
  student: Student;
  checkInTime: string;
  checkInDate: Date;
};

const getMedalColor = (rank: number) => {
    switch (rank) {
        case 1: return "text-yellow-400";
        case 2: return "text-gray-400";
        case 3: return "text-amber-600";
        default: return "text-muted-foreground";
    }
}

// Get all morning attendance records once
const allMorningRecords = Object.entries(mockAttendance).flatMap(([studentId, records]) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return [];

    return records
        .filter(record => record.subject === 'Absensi Pagi' && record.checkInTime)
        .map(record => ({
            student: student,
            checkInTime: record.checkInTime!,
            checkInDate: new Date(`${record.date}T00:00:00`) // Ensure consistent date parsing without time
        }));
});

// Determine the most recent date from the available data to use as "today"
const getMostRecentDate = () => {
    if (allMorningRecords.length === 0) return new Date();
    return allMorningRecords.reduce((latest, record) => {
        return record.checkInDate > latest ? record.checkInDate : latest;
    }, new Date(0));
};

const mostRecentDate = getMostRecentDate();

export function RankingLeaderboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [scope, setScope] = useState<Scope>('all');

  const filteredRankings = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
        case 'week':
            startDate = startOfWeek(mostRecentDate, { weekStartsOn: 1 }); // Monday
            endDate = endOfWeek(mostRecentDate, { weekStartsOn: 1 });
            break;
        case 'month':
            startDate = startOfMonth(mostRecentDate);
            endDate = endOfMonth(mostRecentDate);
            break;
        case 'today':
        default:
            startDate = startOfDay(mostRecentDate);
            endDate = endOfDay(mostRecentDate);
            break;
    }

    const relevantStudents = scope === 'all' 
        ? mockStudents 
        : mockStudents.filter(s => {
            const classInfo = mockClasses.find(c => c.id === scope);
            return s.kelas === classInfo?.name;
        });
    
    const relevantStudentIds = new Set(relevantStudents.map(s => s.id));

    const recordsInDateRange = allMorningRecords.filter(record => {
        return record.checkInDate >= startDate && record.checkInDate <= endDate && relevantStudentIds.has(record.student.id);
    });
    
    // Find the single fastest check-in for each student within the time range
    const studentFastestCheckIns: { [studentId: string]: RankingData } = {};

    recordsInDateRange.forEach(record => {
        const existingRecord = studentFastestCheckIns[record.student.id];
        // Combine date and time for accurate comparison across different days in a week/month view
        const recordDateTime = new Date(`${record.checkInDate.toISOString().split('T')[0]}T${record.checkInTime}`).getTime();
        
        if (!existingRecord) {
             studentFastestCheckIns[record.student.id] = record;
        } else {
            const existingDateTime = new Date(`${existingRecord.checkInDate.toISOString().split('T')[0]}T${existingRecord.checkInTime}`).getTime();
            if(recordDateTime < existingDateTime) {
                studentFastestCheckIns[record.student.id] = record;
            }
        }
    });

    return Object.values(studentFastestCheckIns)
        .sort((a, b) => {
             const aDateTime = new Date(`${a.checkInDate.toISOString().split('T')[0]}T${a.checkInTime}`);
             const bDateTime = new Date(`${b.checkInDate.toISOString().split('T')[0]}T${b.checkInTime}`);
             return aDateTime.getTime() - bDateTime.getTime();
        });
        
  }, [timeRange, scope]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Peringkat Kehadiran Tercepat
                </CardTitle>
                <CardDescription>Siswa dengan rekor waktu check-in paling awal.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select onValueChange={(value: Scope) => setScope(value)} defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Pilih Lingkup" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Keseluruhan</SelectItem>
                        {mockClasses.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value: TimeRange) => setTimeRange(value)} defaultValue="today">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Pilih Rentang Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="week">Minggu Ini</SelectItem>
                        <SelectItem value="month">Bulan Ini</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRankings.length > 0 ? (
            <ul className="space-y-3">
                {filteredRankings.slice(0, 10).map((item, index) => { // Show top 10
                    const rank = index + 1;
                    return (
                        <li key={item.student.id} className={`flex items-center gap-4 p-3 rounded-lg border ${rank <= 3 ? 'bg-muted/50 font-semibold' : ''}`}>
                            <div className={`flex items-center justify-center w-10 text-xl font-bold ${getMedalColor(rank)}`}>
                               {rank <= 3 ? <Medal className="w-7 h-7" /> : <span className="text-base">{rank}</span>}
                            </div>
                             <Avatar className="h-12 w-12 border-2 border-primary/50">
                                {item.student.avatar && <AvatarImage src={item.student.avatar} alt={item.student.name} />}
                                <AvatarFallback style={{ backgroundColor: generateAvatarColor(item.student.name) }}>
                                    {item.student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-base">{item.student.name}</p>
                                <p className="text-sm text-muted-foreground">{item.student.kelas}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">{item.checkInTime}</p>
                                <p className="text-xs text-muted-foreground">{item.checkInDate.toLocaleDateString('id-ID', { weekday: 'long' })}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium">Tidak Ada Data Peringkat</p>
                <p>Belum ada data absensi pagi yang tercatat untuk filter yang dipilih.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
