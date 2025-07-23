
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
import { mockTeachers as initialTeachers, type RosterEntry, type Teacher, type DelegatedTask } from "@/lib/mock-data"

const delegateTaskSchema = z.object({
  substituteTeacherId: z.string().min(1, "Guru pengganti harus dipilih."),
});

type DelegateTaskFormValues = z.infer<typeof delegateTaskSchema>

interface DelegateTaskDialogProps {
    rosterEntry: RosterEntry;
    onTaskDelegated: (delegation: DelegatedTask) => void;
    triggerButton: React.ReactNode;
}

export function DelegateTaskDialog({ rosterEntry, onTaskDelegated, triggerButton }: DelegateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast()

  const form = useForm<DelegateTaskFormValues>({
    resolver: zodResolver(delegateTaskSchema),
    defaultValues: {
      substituteTeacherId: "",
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
        form.reset({ substituteTeacherId: "" });
    }
  }, [isOpen, form, rosterEntry.teacherId]);


  const onSubmit = (data: DelegateTaskFormValues) => {
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

    const newDelegation: DelegatedTask = {
        id: `del-${Date.now()}`,
        rosterEntryId: rosterEntry.id,
        rosterEntry: rosterEntry,
        originalTeacherId: rosterEntry.teacherId,
        substituteTeacherId: data.substituteTeacherId,
        date: today,
    }
    
    onTaskDelegated(newDelegation);

    toast({
      title: "Tugas Berhasil Dialihkan",
      description: `Jadwal telah dialihkan ke guru pengganti untuk hari ini.`,
    })

    form.reset()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alihkan Tugas Mengajar</DialogTitle>
          <DialogDescription>
            Pilih guru pengganti untuk jadwal ini, hanya untuk hari ini.
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
