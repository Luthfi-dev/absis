
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
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { mockSubjects, mockTeachers as initialTeachers, type RosterEntry, type Teacher } from "@/lib/mock-data"

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const rosterEntrySchema = z.object({
  day: z.string().min(1, "Hari harus dipilih."),
  startTime: z.string().min(1, "Waktu mulai harus diisi."),
  endTime: z.string().min(1, "Waktu selesai harus diisi."),
  subjectId: z.string().min(1, "Mata pelajaran harus dipilih."),
  teacherId: z.string().min(1, "Guru harus dipilih."),
}).refine(data => data.endTime > data.startTime, {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endTime"],
});

type RosterFormValues = z.infer<typeof rosterEntrySchema>

interface AddRosterEntryDialogProps {
    classId: string | null;
    day?: string;
    onRosterAdded: (newEntry: RosterEntry) => void;
    triggerButton: React.ReactNode;
}

export function AddRosterEntryDialog({ classId, day, onRosterAdded, triggerButton }: AddRosterEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast()

  const form = useForm<RosterFormValues>({
    resolver: zodResolver(rosterEntrySchema),
    defaultValues: {
      day: day || "",
      startTime: "",
      endTime: "",
      subjectId: "",
      teacherId: "",
    },
  })
  
  useEffect(() => {
    // Load users from localStorage and filter for teachers
    const savedUsers = localStorage.getItem('mockTeachers');
    let allUsers: Teacher[] = [];
    if (savedUsers) {
      allUsers = JSON.parse(savedUsers);
    } else {
      allUsers = initialTeachers;
    }
    const teachers = allUsers.filter(user => user.role === 'teacher');
    setAvailableTeachers(teachers);

    // Reset form when dialog opens
    if (isOpen) {
        form.reset({
            day: day || "",
            startTime: "",
            endTime: "",
            subjectId: "",
            teacherId: "",
        })
    }
  }, [isOpen, day, form]);


  const onSubmit = (data: RosterFormValues) => {
    const newEntry: RosterEntry = {
        id: `r-${Date.now()}`,
        day: data.day,
        time: `${data.startTime} - ${data.endTime}`,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
    }
    
    onRosterAdded(newEntry);

    toast({
      title: "Jadwal Ditambahkan",
      description: `Pelajaran baru telah ditambahkan pada hari ${data.day}.`,
    })

    form.reset()
    setIsOpen(false)
  }

  if (!classId) {
    return <div onClick={() => toast({ variant: "destructive", title: "Pilih Kelas", description: "Anda harus memilih kelas terlebih dahulu."})}>{triggerButton}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Pelajaran</DialogTitle>
          <DialogDescription>
            Pilih detail pelajaran untuk ditambahkan ke roster kelas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hari</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih hari..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Pelajaran</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {mockSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guru</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih guru pengajar..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {availableTeachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
