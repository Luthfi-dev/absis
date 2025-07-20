
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceList } from "@/components/attendance-list"
import { RankingLeaderboard } from "@/components/ranking-leaderboard"

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Kehadiran</h1>
        <p className="text-muted-foreground">Lacak dan analisis data kehadiran siswa secara keseluruhan.</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Daftar Kehadiran</TabsTrigger>
          <TabsTrigger value="ranking">Peringkat Kehadiran</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <AttendanceList />
        </TabsContent>
        <TabsContent value="ranking" className="space-y-4">
          <RankingLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
