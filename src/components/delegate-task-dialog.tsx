
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
import { Loader2, Calendar as CalendarIcon } from "lucide-react"
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
import { mockTeachers as initialTeachers, type RosterEntry, type Teacher, type DelegatedTask } from "@/lib/mock-data"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const delegateTaskSchema = z.object({
  substituteTeacherId: z.string().min(1, "Guru pengganti harus dipilih."),
  date: z.date({
    required_error: "Tanggal pengalihan harus dipilih.",
  }),
}).refine(data => data.date >= new Date(new Date().setHours(0,0,0,0)), {
    message: "Tanggal pengalihan tidak boleh di masa lalu.",
    path: ['date']
});

type DelegateTaskFormValues = z.infer<typeof delegateTaskSchema>

interface DelegateTaskDialogProps {
    rosterEntry: RosterEntry;
    onTaskDelegated: (delegation: DelegatedTask) => void;
    children: React.ReactNode;
}

export function DelegateTaskDialog({ rosterEntry, onTaskDelegated, children }: DelegateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast()

  const form = useForm<DelegateTaskFormValues>({
    resolver: zodResolver(delegateTaskSchema),
    defaultValues: {
      substituteTeacherId: "",
      date: new Date(),
    },
  })
  
  useEffect(() => {
    // Load users from localStorage and filter for active teachers, excluding the original teacher
    const savedUsers = localStorage.getItem('mockTeachers');
    let allUsers: Teacher[] = [];
    if (savedUsers) allUsers = JSON.parse(savedUsers);
    else allUsers = initialTeachers;
    
    const teachers = allUsers.filter(user => user.role === 'teacher' && user.status === 'active' && user.id !== rosterEntry.teacherId);
    setAvailableTeachers(teachers);

    if (isOpen) {
        form.reset({ substituteTeacherId: "" , date: new Date() });
    }
  }, [isOpen, form, rosterEntry.teacherId]);


  const onSubmit = (data: DelegateTaskFormValues) => {
    const newDelegation: DelegatedTask = {
        id: `del-${Date.now()}`,
        rosterEntryId: rosterEntry.id,
        rosterEntry: rosterEntry,
        originalTeacherId: rosterEntry.teacherId,
        substituteTeacherId: data.substituteTeacherId,
        date: format(data.date, 'yyyy-MM-dd'),
    }
    
    onTaskDelegated(newDelegation);

    toast({
      title: "Tugas Berhasil Dialihkan",
      description: `Jadwal telah dialihkan ke guru pengganti untuk tanggal ${format(data.date, 'PPP')}.`,
    })

    form.reset()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alihkan Tugas Mengajar</DialogTitle>
          <DialogDescription>
            Pilih guru pengganti dan tanggal spesifik untuk jadwal ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="substituteTeacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guru Pengganti</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih guru..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {availableTeachers.length > 0 ? (
                            availableTeachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada guru pengganti yang tersedia.</div>
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Pengalihan</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0,0,0,0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
              <Button type="submit" disabled={form.formState.isSubmitting || availableTeachers.length === 0}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alihkan Tugas
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
