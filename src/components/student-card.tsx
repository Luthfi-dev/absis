'use client'

import { Student } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
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

    useEffect(() => {
        const savedBg = localStorage.getItem('card-background')
        if (savedBg) {
            setCardBackground(savedBg)
        }
    }, [])

    const handleFlip = () => {
        if (!isPrintMode) {
            setIsFlipped(!isFlipped)
        }
    }
    
    // In a real app, this would be a proper encryption method.
    // Using Base64 for simulation purposes.
    const encryptedStudentId = btoa(student.id)
    const profileUrl = `${window.location.origin}/profile/${btoa(student.id)}`


    const cardBaseClasses = "w-full aspect-[85.6/54] rounded-xl text-white shadow-lg transition-transform duration-700 preserve-3d"
    const cardContentClasses = "absolute inset-0 w-full h-full flex flex-col justify-between p-4 backface-hidden"

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
                <div className={cn(cardContentClasses, "z-10")}>
                    <div className="flex justify-between items-start">
                        <div className="font-bold text-lg">Kartu Siswa</div>
                        <CheckSquare className="w-8 h-8"/>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="bg-white p-2 rounded-md shadow-md">
                            <QRCode value={encryptedStudentId} size={80} bgColor="#ffffff" fgColor="#000000" level="L" />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="font-semibold text-lg leading-tight">{student.name}</p>
                            <p className="text-sm opacity-90">{student.studentId}</p>
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div className={cn(cardContentClasses, "rotate-y-180 flex-row items-center")}>
                     <div className="flex-1 space-y-2">
                        <p className="text-xs opacity-90">Nama Lengkap</p>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs opacity-90">ID Siswa</p>
                        <p className="font-medium">{student.studentId}</p>
                        <p className="text-xs opacity-90">Email</p>
                        <p className="font-medium text-sm">{student.email}</p>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-2 rounded-md shadow-md">
                            <QRCode value={profileUrl} size={70} bgColor="#ffffff" fgColor="#000000" level="L" />
                        </div>
                        <p className="text-xs text-center">Scan untuk Profil</p>
                     </div>
                </div>
            </div>
        </div>
    )
}
