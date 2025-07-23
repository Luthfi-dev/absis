
'use client'

import { useState, useEffect, useMemo, Fragment } from "react"
import {
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, QrCode, Printer, Trash, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { mockStudents, type Student } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { useRouter } from "next/navigation"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { StudentCardDialog } from "./student-card-dialog"
import { encryptId } from "@/lib/crypto"
import { generateAvatarColor } from "@/lib/utils"

const ITEMS_PER_PAGE = 10;

const ResponsiveRow = ({ student, selected, onSelect, onDelete, onPrint, onViewRecords }: { student: Student; selected: boolean; onSelect: (id: string, checked: boolean) => void; onDelete: (id: string) => void; onPrint: (id: string) => void; onViewRecords: (id: string) => void; }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const ActionMenu = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Buka menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <StudentCardDialog student={student}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Lihat Kartu Digital
                    </DropdownMenuItem>
                </StudentCardDialog>
                <DropdownMenuItem onClick={() => onViewRecords(student.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Catatan
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Ubah
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>Tindakan ini akan menghapus data siswa bernama {student.name}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(student.id)}>Ya, Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <Fragment>
            <TableRow data-state={selected ? "selected" : ""} className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => onSelect(student.id, !!checked)}
                        aria-label={`Pilih ${student.name}`}
                    />
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback style={{ backgroundColor: generateAvatarColor(student.name) }}>
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{student.name}</div>
                    </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{student.studentId}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{student.nisn}</TableCell>
                <TableCell className="hidden lg:table-cell">{student.kelas}</TableCell>
                <TableCell className="pr-4 text-right">
                    <div className="hidden md:flex">
                       <ActionMenu />
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/50 hover:bg-muted/50 md:hidden">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="font-medium text-muted-foreground">ID Siswa</div>
                                    <div><Badge variant="outline">{student.studentId}</Badge></div>
                                </div>
                                 <div className="md:hidden">
                                    <div className="font-medium text-muted-foreground">NISN</div>
                                    <div>{student.nisn}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-muted-foreground">Kelas</div>
                                    <div>{student.kelas}</div>
                                </div>
                                 <div>
                                    <div className="font-medium text-muted-foreground">NIS</div>
                                    <div>{student.nis}</div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <StudentCardDialog student={student}>
                                    <Button variant="outline" size="sm" className="w-full justify-center">
                                        <QrCode />
                                        <span className="sr-only sm:not-sr-only sm:ml-2">Lihat Kartu</span>
                                    </Button>
                                </StudentCardDialog>
                                <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => onViewRecords(student.id)}>
                                    <Eye />
                                    <span className="sr-only sm:not-sr-only sm:ml-2">Lihat Catatan</span>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="w-full justify-center" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 />
                                            <span className="sr-only sm:not-sr-only sm:ml-2">Hapus</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>Tindakan ini akan menghapus data siswa bernama {student.name}.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(student.id)}>Ya, Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    )
}

export function StudentTable() {
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStudents = localStorage.getItem('mockStudents');
      if (!savedStudents) {
        localStorage.setItem('mockStudents', JSON.stringify(mockStudents));
        return mockStudents;
      }
      try {
        return JSON.parse(savedStudents)
      } catch {
        localStorage.setItem('mockStudents', JSON.stringify(mockStudents));
        return mockStudents;
      }
    }
    return mockStudents;
  });
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const handleStudentAdded = () => {
        const savedStudents = localStorage.getItem('mockStudents');
        if (savedStudents) {
            setStudents(JSON.parse(savedStudents));
        }
    };

    window.addEventListener('studentAdded', handleStudentAdded);
    return () => {
        window.removeEventListener('studentAdded', handleStudentAdded);
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.includes(searchTerm) ||
      student.nisn.includes(searchTerm) ||
      student.kelas.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);


  const updateLocalStorage = (updatedStudents: Student[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockStudents', JSON.stringify(updatedStudents));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(paginatedStudents.map(s => s.id)))
    } else {
      setSelectedStudents(new Set())
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelection = new Set(selectedStudents)
    if (checked) {
      newSelection.add(studentId)
    } else {
      newSelection.delete(studentId)
    }
    setSelectedStudents(newSelection)
  }

  const handleDelete = (idsToDelete: string[]) => {
    const updatedStudents = students.filter((student) => !idsToDelete.includes(student.id))
    setStudents(updatedStudents)
    updateLocalStorage(updatedStudents)

    const newSelection = new Set(selectedStudents)
    idsToDelete.forEach(id => newSelection.delete(id))
    setSelectedStudents(newSelection)
  }

  const handlePrint = (idsToPrint: string[]) => {
    const encryptedIds = idsToPrint.map(id => encryptId(id));
    router.push(`/students/print?ids=${encryptedIds.join(',')}`)
  }

  const handleViewRecords = (studentId: string) => {
    router.push(`/records/${encryptId(studentId)}`)
  }
  
  const isAllSelectedOnPage = selectedStudents.size > 0 && paginatedStudents.every(s => selectedStudents.has(s.id)) && paginatedStudents.length > 0;

  return (
    <>
      <div className="p-4 sm:p-6 border-b">
        <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari siswa (nama, ID, NIS, kelas...)"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                    }}
                />
            </div>
            {selectedStudents.size > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{selectedStudents.size} terpilih</span>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(Array.from(selectedStudents))}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini akan menghapus {selectedStudents.size} data siswa secara permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(Array.from(selectedStudents))}>
                                    Ya, Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
      </div>
      <CardContent className="p-0">
        <div className="rounded-lg bg-card text-card-foreground">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px] pl-4">
                    <Checkbox
                        checked={isAllSelectedOnPage}
                        onCheckedChange={handleSelectAll}
                        aria-label="Pilih semua di halaman ini"
                        disabled={paginatedStudents.length === 0}
                    />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden lg:table-cell">ID Siswa</TableHead>
                <TableHead className="hidden md:table-cell">NISN</TableHead>
                <TableHead className="hidden lg:table-cell">Kelas</TableHead>
                <TableHead className="pr-4">
                    <span className="sr-only">Aksi</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedStudents.length > 0 ? paginatedStudents.map((student) => (
                    <ResponsiveRow 
                        key={student.id} 
                        student={student}
                        selected={selectedStudents.has(student.id)}
                        onSelect={handleSelectStudent}
                        onDelete={() => handleDelete([student.id])}
                        onPrint={() => handlePrint([student.id])}
                        onViewRecords={() => handleViewRecords(student.id)}
                    />
                )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada hasil.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
                Menampilkan {paginatedStudents.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-{(currentPage - 1) * ITEMS_PER_PAGE + paginatedStudents.length} dari {filteredStudents.length} siswa.
            </div>
            <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            <span className="text-sm font-medium">
                Halaman {currentPage} dari {totalPages || 1}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
        </div>
      </CardContent>
    </>
  )
}
