
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import { mockStudents, Student, mockAttendance, AttendanceRecord } from "@/lib/mock-data"
import jsQR from "jsqr"
import { decryptId } from "@/lib/crypto"
import type { CameraFacingMode } from "@/lib/types"

export type ScanResult = {
  status: "success" | "error";
  message: string;
  student?: Student;
  timestamp?: string;
  scannedData: string;
};

type BarcodeScannerProps = {
  onScanComplete: (result: ScanResult) => void;
  setCameraError: (error: string | null) => void;
  isPaused: boolean;
  facingMode: CameraFacingMode;
}

const getAttendanceFromStorage = (): Record<string, AttendanceRecord[]> => {
    if (typeof window === 'undefined') return mockAttendance;
    const saved = localStorage.getItem('mockAttendance');
    if (!saved) {
        localStorage.setItem('mockAttendance', JSON.stringify(mockAttendance));
        return mockAttendance;
    }
    return JSON.parse(saved);
}

const saveAttendanceToStorage = (attendance: Record<string, AttendanceRecord[]>) => {
    localStorage.setItem('mockAttendance', JSON.stringify(attendance));
    window.dispatchEvent(new Event('attendanceUpdated')); // For real-time updates elsewhere if needed
}

export function BarcodeScanner({ onScanComplete, setCameraError, isPaused, facingMode }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number>()
  const [isInitializing, setIsInitializing] = useState(true);

  const handleCheckIn = useCallback((scannedData: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;
    
    if (!scannedData || scannedData.length < 10) { 
        return; 
    }

    const studentId = decryptId(scannedData);

    if (studentId === 'decryption_error') {
      onScanComplete({ status: "error", message: `QR Code tidak valid atau rusak.`, timestamp: timestamp, scannedData: scannedData });
      return;
    }

    const student = mockStudents.find(s => s.id === studentId);

    if (!student) {
      onScanComplete({ status: "error", message: `Siswa tidak ditemukan.`, timestamp: timestamp, scannedData: scannedData });
      return;
    }

    const attendanceData = getAttendanceFromStorage();
    const studentRecords = attendanceData[studentId] || [];
    const todaysRecord = studentRecords.find(r => r.date === todayStr && r.subject === 'Absensi Pagi');

    const checkInTimeSetting = localStorage.getItem('school-check-in-time') || '07:00';
    const checkOutTimeSetting = localStorage.getItem('school-check-out-time') || '15:00';

    const [inHours, inMinutes] = checkInTimeSetting.split(':').map(Number);
    const checkInTime = new Date(now);
    checkInTime.setHours(inHours, inMinutes, 0, 0);

    const [outHours, outMinutes] = checkOutTimeSetting.split(':').map(Number);
    const checkOutTime = new Date(now);
    checkOutTime.setHours(outHours, outMinutes, 0, 0);

    if (todaysRecord) {
        // Already checked in today
        if (now >= checkOutTime && !todaysRecord.checkOutTime) {
            // This is a check-out scan
            todaysRecord.checkOutTime = now.toLocaleTimeString('id-ID');
            saveAttendanceToStorage(attendanceData);
            onScanComplete({ status: "success", message: "Absensi pulang berhasil.", student, timestamp, scannedData });
        } else {
            // This is a repeated scan before check-out time
            onScanComplete({ status: "success", message: "Siswa sudah absen masuk hari ini.", student, timestamp, scannedData });
        }
    } else {
        // This is a new check-in scan
        const newStatus = now <= checkInTime ? 'Tepat Waktu' : 'Terlambat';
        const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            subject: 'Absensi Pagi', // Special subject for morning attendance
            date: todayStr,
            status: newStatus,
            checkInTime: now.toLocaleTimeString('id-ID'),
        };

        if (!attendanceData[studentId]) {
            attendanceData[studentId] = [];
        }
        attendanceData[studentId].push(newRecord);
        saveAttendanceToStorage(attendanceData);

        const message = newStatus === 'Tepat Waktu' ? 'Absensi diterima. Tepat waktu!' : 'Absensi diterima. Terlambat.';
        onScanComplete({ status: "success", message, student, timestamp, scannedData });
    }
  }, [onScanComplete]);
  
  useEffect(() => {
    let isActive = true;

    const startCamera = async () => {
      setIsInitializing(true);
      setCameraError(null);
      
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        if (isActive) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setIsInitializing(false);
        } else {
            stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if(isActive) {
            if (err.name === 'NotAllowedError') {
              setCameraError("Mohon izinkan akses kamera di pengaturan peramban Anda untuk melanjutkan.");
            } else {
              setCameraError(`Gagal memulai kamera: ${err.message}. Pastikan tidak digunakan oleh aplikasi lain.`);
            }
            setIsInitializing(false);
        }
      } 
    };
    
    startCamera();

    return () => {
      isActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [facingMode, setCameraError]); 

  useEffect(() => {
    const tick = () => {
      if (isPaused || isInitializing || !videoRef.current || !videoRef.current.videoWidth) {
        if(!isPaused) animationFrameId.current = requestAnimationFrame(tick);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              handleCheckIn(code.data);
            }
          } catch (error) {
            // Ignore getImageData errors
          }
        }
      }
      if(!isPaused) animationFrameId.current = requestAnimationFrame(tick);
    };

    if (!isPaused) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    
    return () => {
        if(animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current)
        }
    }
  }, [isPaused, isInitializing, handleCheckIn]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-md">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
      
      {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/70 z-30">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Memulai kamera...</p>
          </div>
      )}
      
      {!isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-px bg-red-500 animate-scan-y shadow-[0_0_10px_1px_#ef4444]" />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-white text-center p-3 rounded-lg animate-pulse-slow">
              <p className="font-medium">Arahkan QR Code Kartu Siswa ke Kamera</p>
            </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
