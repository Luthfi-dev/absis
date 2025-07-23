'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Student } from "@/lib/mock-data"
import { StudentCard } from "./student-card"

interface StudentCardDialogProps {
    student: Student;
    children: React.ReactNode;
}

export function StudentCardDialog({ student, children }: StudentCardDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
                <DialogHeader>
                    <DialogTitle className="sr-only">Kartu Siswa Digital: {student.name}</DialogTitle>
                </DialogHeader>
                <StudentCard student={student} />
            </DialogContent>
        </Dialog>
    )
}
