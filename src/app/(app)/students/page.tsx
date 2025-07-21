
import { StudentTable } from "@/components/student-table"
import { RosterImporter } from "@/components/roster-importer"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { Card } from "@/components/ui/card"

export default function StudentsPage() {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Siswa</h1>
            <p className="text-muted-foreground">Tambah, ubah, dan kelola daftar siswa Anda.</p>
        </div>
        <div className="flex items-center gap-2">
            <AddStudentDialog />
            <RosterImporter />
        </div>
      </div>
      
      <Card>
        <StudentTable />
      </Card>
    </>
  )
}
