
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
    const savedStudents = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mockStudents') || JSON.stringify(mockStudents)) : mockStudents;
    const students = savedStudents.filter((s: Student) => ids.includes(s.id))
    setStudentsToPrint(students)
  }, [searchParams])

  return (
    <div className="print-container bg-gray-100 dark:bg-gray-800 min-h-screen">
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
                 <div className="print-area grid grid-cols-1 gap-4">
                    {studentsToPrint.map(student => (
                        <div key={student.id} className="print-item-container break-inside-avoid">
                           <div className="grid grid-cols-2">
                             <div className="print-card-wrapper">
                                <StudentCard student={student} isPrintMode={true} initialSide="front" />
                             </div>
                             <div className="print-card-wrapper">
                                <StudentCard student={student} isPrintMode={true} initialSide="back" />
                             </div>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center py-24 text-center print:hidden">
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
                body, .print-container {
                    background: #ffffff !important;
                    margin: 0;
                    padding: 0;
                }
                .print-container > header {
                    display: none;
                }
                main {
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .print-area {
                   display: flex;
                   flex-direction: column;
                   gap: 1rem;
                }
                .print-item-container {
                    page-break-inside: avoid;
                }
                .print-card-wrapper {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    margin-left: 15px;
                }
            }
            @page {
              size: A4;
              margin: 1cm;
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
