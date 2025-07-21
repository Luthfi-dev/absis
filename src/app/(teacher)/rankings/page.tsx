
'use client'

import { RankingLeaderboard } from "@/components/ranking-leaderboard"

export default function TeacherRankingsPage() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Peringkat Kehadiran</h1>
        <p className="text-muted-foreground">Lihat peringkat kehadiran siswa tercepat secara keseluruhan atau per kelas.</p>
      </div>
      <RankingLeaderboard />
    </>
  )
}
