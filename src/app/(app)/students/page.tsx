
import { StudentTable } from "@/components/student-table"
import { RosterImporter } from "@/components/roster-importer"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { Card } from "@/components/ui/card"

export default function StudentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Siswa</h1>
          <p className="text-muted-foreground mt-1">Tambah, ubah, dan kelola daftar siswa Anda.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AddStudentDialog />
          <RosterImporter />
        </div>
      </div>
      <Card>
        <StudentTable />
      </Card>
    </div>
  )
}
