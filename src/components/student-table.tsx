
"use client"

import { useState, useEffect, useMemo } from "react"
import {
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, QrCode, Printer, Trash, Search, User } from "lucide-react"
import { mockStudents, type Student } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
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
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import { StudentCardDialog } from "./student-card-dialog"
import { encryptId } from "@/lib/crypto"

const ITEMS_PER_PAGE = 10;

export function StudentTable() {
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStudents = localStorage.getItem('mockStudents');
      if (!savedStudents) {
        localStorage.setItem('mockStudents', JSON.stringify(mockStudents));
        return mockStudents;
      }
      return JSON.parse(savedStudents);
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
  
  const isAllSelected = selectedStudents.size > 0 && selectedStudents.size === paginatedStudents.length && paginatedStudents.length > 0;

  return (
    <>
      <CardHeader>
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
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px] pl-4">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Pilih semua"
                        disabled={paginatedStudents.length === 0}
                    />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">ID Siswa</TableHead>
                <TableHead className="hidden sm:table-cell">NISN</TableHead>
                <TableHead className="hidden sm:table-cell">Kelas</TableHead>
                <TableHead className="pr-4">
                    <span className="sr-only">Aksi</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedStudents.length > 0 ? paginatedStudents.map((student) => (
                <TableRow key={student.id} data-state={selectedStudents.has(student.id) ? "selected" : ""}>
                    <TableCell className="pl-4">
                        <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                            aria-label={`Pilih ${student.name}`}
                        />
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                          {student.avatar && <AvatarImage src={student.avatar} alt={student.name} />}
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{student.name}</div>
                    </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{student.studentId}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.nisn}</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.kelas}</TableCell>
                    <TableCell className="pr-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
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
                        <DropdownMenuItem onSelect={() => router.push(`/records/${encryptId(student.id)}`)}>
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
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onSelect={(e) => e.preventDefault()}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini akan menghapus data siswa bernama {student.name}.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete([student.id])}>
                                        Ya, Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
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
        <div className="flex items-center justify-between pt-4 px-6 pb-6">
            <div className="text-sm text-muted-foreground">
                Menampilkan {paginatedStudents.length} dari {filteredStudents.length} siswa.
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
    </>
  )
}
