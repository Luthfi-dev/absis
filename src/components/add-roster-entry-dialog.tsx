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
import { mockSubjects, mockTeachers, type RosterEntry } from "@/lib/mock-data"

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const rosterEntrySchema = z.object({
  day: z.string().min(1, "Hari harus dipilih."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d) - ([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu harus HH:mm - HH:mm."),
  subjectId: z.string().min(1, "Mata pelajaran harus dipilih."),
  teacherId: z.string().min(1, "Guru harus dipilih."),
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
  const { toast } = useToast()

  const form = useForm<RosterFormValues>({
    resolver: zodResolver(rosterEntrySchema),
    defaultValues: {
      day: day || "",
      time: "",
      subjectId: "",
      teacherId: "",
    },
  })
  
  // Reset form when dialog opens with a new day
  useState(() => {
    form.reset({
        day: day || "",
        time: "",
        subjectId: "",
        teacherId: "",
    })
  });


  const onSubmit = (data: RosterFormValues) => {
    const newEntry: RosterEntry = {
        id: `r-${Date.now()}`,
        ...data,
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
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waktu (cth. 07:00 - 08:30)</FormLabel>
                  <FormControl>
                    <Input placeholder="HH:mm - HH:mm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        {mockTeachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
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
