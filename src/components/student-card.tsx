
'use client'

import { Student } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import QRCode from "react-qr-code"
import { useState, useEffect } from "react"
import { CheckSquare } from "lucide-react"

interface StudentCardProps {
    student: Student
    initialSide?: 'front' | 'back'
    isPrintMode?: boolean
}

export function StudentCard({ student, initialSide = 'front', isPrintMode = false }: StudentCardProps) {
    const [isFlipped, setIsFlipped] = useState(initialSide === 'back')
    const [cardBackground, setCardBackground] = useState<string | null>(null)
    const [origin, setOrigin] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBg = localStorage.getItem('card-background');
            if (savedBg) setCardBackground(savedBg);

            const savedMessage = localStorage.getItem('card-lost-message') || '';
            setCustomMessage(savedMessage);

            setOrigin(window.location.origin);
        }
    }, []);

    const handleFlip = () => {
        if (!isPrintMode) {
            setIsFlipped(!isFlipped)
        }
    }
    
    const encryptedStudentId = typeof window !== 'undefined' ? btoa(student.id) : '';
    const profileUrl = origin ? `${origin}/profile/${btoa(student.id)}` : '';

    const cardBaseClasses = "w-[21rem] h-[13.125rem] rounded-xl text-white shadow-lg transition-transform duration-700 preserve-3d"
    const cardContentClasses = "absolute inset-0 w-full h-full p-4 backface-hidden"

    return (
        <div className="perspective-1000">
            <div
                className={cn(cardBaseClasses, isFlipped && "rotate-y-180")}
                onClick={handleFlip}
                style={{
                    cursor: isPrintMode ? 'default' : 'pointer',
                    backgroundImage: cardBackground ? `url(${cardBackground})` : 'linear-gradient(to right, #8FBC8F, #77DD77)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Front Side */}
                <div className={cn(cardContentClasses, "z-10 flex flex-col justify-between")}>
                    <header className="flex justify-between items-start">
                        <div className="font-bold text-lg">Kartu Siswa</div>
                        <CheckSquare className="w-8 h-8"/>
                    </header>
                    <footer className="flex items-end gap-3">
                        <div className="bg-white p-1 rounded-md shadow-md">
                           {encryptedStudentId && <QRCode value={encryptedStudentId} size={70} bgColor="#ffffff" fgColor="#000000" level="L" />}
                        </div>
                        <div className="flex-1 text-right overflow-hidden">
                            <p className="font-semibold text-lg leading-tight truncate">{student.name}</p>
                            <p className="text-sm opacity-90">{student.studentId}</p>
                        </div>
                    </footer>
                </div>

                {/* Back Side */}
                <div className={cn(cardContentClasses, "rotate-y-180 flex flex-col")}>
                    <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1 overflow-hidden">
                           <p className="text-xs opacity-90">Nama Lengkap</p>
                           <p className="font-medium text-base truncate">{student.name}</p>
                           <p className="text-xs opacity-90 pt-2">NIS</p>
                           <p className="font-medium text-base truncate">{student.nis}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                           <div className="bg-white p-1 rounded-md shadow-md">
                              {profileUrl && <QRCode value={profileUrl} size={60} bgColor="#ffffff" fgColor="#000000" level="L" />}
                           </div>
                           <p className="text-[10px] text-center">Pindai untuk Profil</p>
                        </div>
                    </div>
                    {customMessage && (
                        <div className="mt-auto text-center text-[9px] opacity-80 leading-tight">
                            {customMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
