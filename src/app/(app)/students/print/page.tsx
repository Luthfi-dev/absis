
'use client'

import { useSearchParams } from 'next/navigation'
import { mockStudents, Student } from '@/lib/mock-data'
import { Suspense, useEffect, useState } from 'react'
import { StudentCard } from '@/components/student-card'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

function PrintPageContent() {
  const searchParams = useSearchParams()
  const [studentsToPrint, setStudentsToPrint] = useState<Student[]>([])

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') ?? []
    // Initialize with mockStudents if localStorage is empty or doesn't have the student
    const savedStudents = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mockStudents') || JSON.stringify(mockStudents)) : mockStudents;
    const students = savedStudents.filter((s: Student) => ids.includes(s.id))
    setStudentsToPrint(students)
  }, [searchParams])

  return (
    <div className="bg-background min-h-screen">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm print:hidden">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <h1 className="text-xl font-bold font-headline">Cetak Kartu Siswa</h1>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Halaman
                </Button>
            </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {studentsToPrint.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                    {studentsToPrint.map(student => (
                        <div key={student.id} className="space-y-4 page-break-inside-avoid">
                            <StudentCard student={student} initialSide="front" isPrintMode={true} />
                            <StudentCard student={student} initialSide="back" isPrintMode={true} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center py-24 text-center">
                    <div className="max-w-md">
                        <h2 className="text-2xl font-semibold">Tidak ada siswa yang dipilih</h2>
                        <p className="text-muted-foreground mt-2">
                            Silakan kembali ke halaman siswa dan pilih setidaknya satu siswa untuk dicetak kartunya.
                        </p>
                    </div>
                </div>
            )}
        </main>
        <style jsx global>{`
            @media print {
                body {
                    background-color: #fff;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .page-break-inside-avoid {
                    page-break-inside: avoid;
                }
                main {
                    padding: 0;
                }
            }
        `}</style>
    </div>
  )
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PrintPageContent />
        </Suspense>
    )
}

