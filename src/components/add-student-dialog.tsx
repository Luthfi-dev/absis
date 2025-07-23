
'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Student } from "@/lib/mock-data"
import { mockClasses } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const getStudentsFromStorage = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const savedStudents = localStorage.getItem('mockStudents');
    return savedStudents ? JSON.parse(savedStudents) : [];
}

const studentSchema = z.object({
  namaLengkap: z.string().min(3, "Nama lengkap harus memiliki setidaknya 3 karakter."),
  nis: z.string().min(1, "NIS tidak boleh kosong."),
  nisn: z.string().min(1, "NISN tidak boleh kosong."),
  kelas: z.string().min(1, "Kelas harus dipilih."),
  nomorOrangTua: z.string().optional(),
}).refine((data) => {
    const students = getStudentsFromStorage();
    return !students.some(s => s.nis === data.nis);
}, {
    message: "NIS ini sudah terdaftar.",
    path: ["nis"],
}).refine((data) => {
    const students = getStudentsFromStorage();
    return !students.some(s => s.nisn === data.nisn);
}, {
    message: "NISN ini sudah terdaftar.",
    path: ["nisn"],
})

type StudentFormValues = z.infer<typeof studentSchema>

// In a real app, this would come from a global state/context or be refetched.
// For now, we'll just rely on a browser event to notify the table.
const dispatchStudentAddedEvent = () => {
    window.dispatchEvent(new Event('studentAdded'));
};

const generateNextStudentId = (students: Student[]): string => {
    if (!students.length) return 'S001';
    const lastStudent = students.reduce((latest, current) => {
        const latestNum = parseInt(latest.studentId.substring(1), 10);
        const currentNum = parseInt(current.studentId.substring(1), 10);
        return currentNum > latestNum ? current : latest;
    });
    const lastIdNum = parseInt(lastStudent.studentId.substring(1), 10);
    const nextIdNum = lastIdNum + 1;
    return `S${String(nextIdNum).padStart(3, '0')}`;
}


export function AddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      namaLengkap: "",
      nis: "",
      nisn: "",
      kelas: "",
      nomorOrangTua: "",
    },
  })
  
  useEffect(() => {
    if (isOpen) {
        form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = (data: StudentFormValues) => {
    const students = getStudentsFromStorage();
    const newStudentId = generateNextStudentId(students);
    
    // In a real application, you would make an API call here.
    // For this mock, we'll just show a success message.
    console.log("New student data:", data)
    toast({
      title: "Siswa Berhasil Ditambahkan",
      description: `${data.namaLengkap} telah ditambahkan dengan ID ${newStudentId}.`,
    })

    const newStudent: Student = { 
        id: Date.now().toString(), 
        studentId: newStudentId,
        name: data.namaLengkap,
        nis: data.nis,
        nisn: data.nisn,
        kelas: data.kelas,
        nomorOrangTua: data.nomorOrangTua,
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${newStudentId}` 
    };

    localStorage.setItem('mockStudents', JSON.stringify([...students, newStudent]));
    dispatchStudentAddedEvent();


    form.reset()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini untuk menambahkan siswa baru. ID Siswa akan dibuat otomatis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaLengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Budi Doremi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIS</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. 212210123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. 0012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {mockClasses.map(cls => <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="nomorOrangTua"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Orang Tua (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. 081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Siswa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
