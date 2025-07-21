import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DynamicSchedule } from "@/components/dynamic-schedule"
import { Users, UserCheck, UserX, BookOpen, UserCircle } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "Total Siswa", value: "152", icon: Users, color: "text-blue-500" },
    { title: "Total Guru", value: "15", icon: UserCircle, color: "text-purple-500" },
    { title: "Total Mata Pelajaran", value: "20", icon: BookOpen, color: "text-yellow-500" },
    { title: "Hadir Hari Ini", value: "140", icon: UserCheck, color: "text-green-500" },
    { title: "Absen Hari Ini", value: "12", icon: UserX, color: "text-red-500" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Super Admin</h1>
          <p className="text-muted-foreground">Selamat datang kembali! Berikut adalah ringkasan sistem Anda.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <DynamicSchedule />
        </div>
    </div>
  )
}
