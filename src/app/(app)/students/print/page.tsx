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
    const students = mockStudents.filter(s => ids.includes(s.id))
    setStudentsToPrint(students)
  }, [searchParams])

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 print:hidden">
                <h1 className="text-2xl font-bold font-headline">Cetak Kartu Siswa</h1>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Halaman
                </Button>
            </div>
            {studentsToPrint.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                    {studentsToPrint.map(student => (
                        <div key={student.id} className="space-y-4 page-break-inside-avoid">
                            <StudentCard student={student} initialSide="front" isPrintMode={true} />
                            <StudentCard student={student} initialSide="back" isPrintMode={true} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p>Tidak ada siswa yang dipilih untuk dicetak.</p>
                </div>
            )}
        </div>
        <style jsx global>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .page-break-inside-avoid {
                    page-break-inside: avoid;
                }
            }
        `}</style>
    </div>
  )
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintPageContent />
        </Suspense>
    )
}
