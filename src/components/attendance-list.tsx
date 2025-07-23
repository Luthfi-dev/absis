
'use client'

import { useState, useMemo, Fragment } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { mockStudents, mockAttendance } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Excellent':
            return 'success';
        case 'Terlambat':
            return 'warning';
        case 'Hadir':
            return 'default';
        default:
            return 'destructive';
    }
}

const allAttendanceRecords = Object.entries(mockAttendance).flatMap(([studentId, records]) => {
    const student = mockStudents.find(s => s.id === studentId)
    return records.map(record => ({
        ...record,
        studentName: student?.name || 'Unknown',
        studentId: student?.studentId || 'N/A'
    }))
}).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateB - dateA;
    const timeA = a.checkInTime ? a.checkInTime.split(':').join('') : '999999';
    const timeB = b.checkInTime ? b.checkInTime.split(':').join('') : '999999';
    return Number(timeA) - Number(timeB);
});

const ResponsiveRow = ({ record }: { record: (typeof allAttendanceRecords)[0] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Fragment>
            <TableRow className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell className="md:hidden">
                    <div className="flex flex-col">
                       <span className="font-medium">{record.studentName}</span>
                       <span className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString('id-ID')}</span>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="hidden md:table-cell font-medium">{record.studentName}</TableCell>
                <TableCell className="hidden lg:table-cell">{record.subject}</TableCell>
                <TableCell className="hidden lg:table-cell">{record.checkInTime || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">{record.checkOutTime || '-'}</TableCell>
                <TableCell className="text-right">
                   <div className="flex items-center justify-end">
                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                 <TableRow className="bg-muted/50 hover:bg-muted/50 lg:hidden">
                    <TableCell colSpan={7}>
                        <div className="grid grid-cols-2 gap-4 p-2 text-sm">
                            <div>
                                <div className="font-medium text-muted-foreground">Mata Pelajaran</div>
                                <div>{record.subject}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Jam Masuk</div>
                                <div>{record.checkInTime || '-'}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Jam Pulang</div>
                                <div>{record.checkOutTime || '-'}</div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    )
}

export function AttendanceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = useMemo(() => {
    return allAttendanceRecords.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(record.date).toLocaleDateString('id-ID').includes(searchTerm)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <CardTitle>Semua Catatan Kehadiran</CardTitle>
                    <CardDescription>Menampilkan semua data kehadiran yang tercatat dalam sistem.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari (nama, pelajaran, tanggal...)"
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="md:hidden">Siswa</TableHead>
                        <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                        <TableHead className="hidden md:table-cell">Nama Siswa</TableHead>
                        <TableHead className="hidden lg:table-cell">Mata Pelajaran</TableHead>
                        <TableHead className="hidden lg:table-cell">Jam Masuk</TableHead>
                        <TableHead className="hidden lg:table-cell">Jam Pulang</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                        <ResponsiveRow key={`${record.id}-${record.studentId}`} record={record} />
                      )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Tidak ada hasil.
                            </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Menampilkan {paginatedRecords.length} dari {filteredRecords.length} catatan.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
  )
}
