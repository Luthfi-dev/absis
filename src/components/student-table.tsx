"use client"

import { useState, useEffect } from "react"
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
import { MoreHorizontal, Eye, Edit, Trash2, QrCode, Printer, Trash } from "lucide-react"
import { mockStudents, type Student } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { useRouter } from "next/navigation"
import { Checkbox } from "./ui/checkbox"
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

export function StudentTable() {
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStudents = localStorage.getItem('mockStudents');
      return savedStudents ? JSON.parse(savedStudents) : mockStudents;
    }
    return mockStudents;
  });
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    // Save initial mock data to localStorage if not already present
    if (typeof window !== 'undefined' && !localStorage.getItem('mockStudents')) {
      localStorage.setItem('mockStudents', JSON.stringify(mockStudents));
    }

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

  const updateLocalStorage = (updatedStudents: Student[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockStudents', JSON.stringify(updatedStudents));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(students.map(s => s.id)))
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
    router.push(`/students/print?ids=${idsToPrint.join(',')}`)
  }

  const isAllSelected = selectedStudents.size > 0 && selectedStudents.size === students.length

  return (
    <>
      {selectedStudents.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-2 shadow-sm">
            <span className="text-sm font-medium pl-2">{selectedStudents.size} siswa terpilih</span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePrint(Array.from(selectedStudents))}>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak QR
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
        </div>
      )}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Pilih semua"
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">ID Siswa</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} data-state={selectedStudents.has(student.id) ? "selected" : ""}>
                 <TableCell>
                    <Checkbox
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                        aria-label={`Pilih ${student.name}`}
                    />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{student.name}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{student.studentId}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{student.email}</TableCell>
                <TableCell>
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
                      <DropdownMenuItem onSelect={() => router.push(`/records/${student.id}`)}>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
