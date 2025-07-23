
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockSchedule, type ScheduleItem } from "@/lib/mock-data"
import { CalendarClock } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Fragment, useState } from "react"
import { Button } from "./ui/button"

function getStatusVariant(status: ScheduleItem['status']) {
  switch (status) {
    case 'Sedang Berlangsung':
      return 'default'
    case 'Selesai':
      return 'secondary'
    case 'Akan Datang':
      return 'outline'
    default:
      return 'default'
  }
}

const ResponsiveRow = ({ item }: { item: ScheduleItem }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Fragment>
            <TableRow className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell className="font-medium md:hidden">
                    <div className="flex flex-col">
                        <span>{item.subject}</span>
                        <span className="text-xs text-muted-foreground">{item.teacher}</span>
                    </div>
                </TableCell>
                <TableCell className="font-medium hidden md:table-cell">{item.time}</TableCell>
                <TableCell className="hidden md:table-cell">{item.subject}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.class}</TableCell>
                <TableCell className="hidden md:table-cell">{item.teacher}</TableCell>
                <TableCell className="text-right">
                   <div className="flex items-center justify-end">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/50 hover:bg-muted/50 md:hidden">
                    <TableCell colSpan={3}>
                        <div className="space-y-2 text-sm p-2">
                            <div>
                                <div className="font-medium text-muted-foreground">Waktu</div>
                                <div>{item.time}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Kelas</div>
                                <div>{item.class}</div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    )
}

export function DynamicSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6" />
          Jadwal Hari Ini
        </CardTitle>
        <CardDescription>Kelas yang sedang berlangsung dan akan datang hari ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="md:hidden">Pelajaran</TableHead>
                        <TableHead className="hidden md:table-cell">Waktu</TableHead>
                        <TableHead className="hidden md:table-cell">Pelajaran</TableHead>
                        <TableHead className="hidden lg:table-cell">Kelas</TableHead>
                        <TableHead className="hidden md:table-cell">Guru</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {mockSchedule.length > 0 ? mockSchedule.map((item) => (
                    <ResponsiveRow key={item.id} item={item} />
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            Tidak ada jadwal untuk hari ini.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}
