'use client'

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
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

const studentSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki setidaknya 3 karakter."),
  studentId: z.string().min(1, "ID Siswa tidak boleh kosong."),
  email: z.string().email("Format email tidak valid."),
})

type StudentFormValues = z.infer<typeof studentSchema>

// In a real app, this would come from a global state/context or be refetched.
// For now, we'll just rely on a browser event to notify the table.
const dispatchStudentAddedEvent = () => {
    window.dispatchEvent(new Event('studentAdded'));
};


export function AddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      studentId: "",
      email: "",
    },
  })

  const onSubmit = (data: StudentFormValues) => {
    // In a real application, you would make an API call here.
    // For this mock, we'll just show a success message.
    console.log("New student data:", data)
    toast({
      title: "Siswa Berhasil Ditambahkan",
      description: `${data.name} telah ditambahkan ke dalam daftar.`,
    })

    // This is a mock way to update the table.
    // In a real app, you'd likely use a state management library or refetch data.
    const newStudent = { ...data, id: Date.now().toString(), avatar: `https://i.pravatar.cc/150?u=${data.studentId}` };
    const students = JSON.parse(localStorage.getItem('mockStudents') || '[]');
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
            Isi detail di bawah ini untuk menambahkan siswa baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Siswa</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. S006" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. budi@example.com" {...field} />
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
