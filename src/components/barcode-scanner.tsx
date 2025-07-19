"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { ScanLine, AlertTriangle } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"
import jsQR from "jsqr"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export type ScanResult = {
  status: "success" | "error";
  message: string;
  student?: Student;
  timestamp?: string;
  scannedData: string;
};

type BarcodeScannerProps = {
  onScanComplete: (result: ScanResult) => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScanComplete, isScanning }: BarcodeScannerProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  const cleanupScanner = useCallback(() => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
    }
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
    }
    stopCamera()
  },[stopCamera]);

  const handleCheckIn = useCallback((scannedData: string) => {
    let studentId: string;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;
    
    try {
      studentId = atob(scannedData);
    } catch (e) {
      onScanComplete({
          status: "error",
          message: `QR Code tidak valid.`,
          timestamp: timestamp,
          scannedData: scannedData,
      });
      return;
    }

    const student = mockStudents.find(s => s.id === studentId);

    if (student) {
        onScanComplete({
            status: "success",
            message: "Berhasil melakukan absensi.",
            student: student,
            timestamp: timestamp,
            scannedData: scannedData,
        });
    } else {
        onScanComplete({
            status: "error",
            message: `Siswa tidak ditemukan.`,
            timestamp: timestamp,
            scannedData: scannedData,
        });
    }
  }, [onScanComplete]);
  
  // Effect to manage camera stream
  useEffect(() => {
    if (isScanning) {
        const getCameraPermission = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    setHasCameraPermission(true)
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                        videoRef.current.play().catch(err => {
                            console.error("Gagal memulai video:", err)
                            toast({ variant: "destructive", title: "Error Kamera", description: "Tidak bisa memutar pratinjau kamera." });
                        })
                    }
                } catch (error) {
                    console.error('Error saat mengakses kamera:', error)
                    setHasCameraPermission(false)
                }
            } else {
                setHasCameraPermission(false)
            }
        }
        getCameraPermission()
    } else {
        cleanupScanner();
    }
    return () => {
       cleanupScanner();
    }
  }, [isScanning, toast, cleanupScanner])

  // Effect for QR scanning loop
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!isScanning || !hasCameraPermission || !video || !canvas) {
        return;
    }

    let running = true;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    // Set a timeout to stop scanning after 1 minute of inactivity
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
        if(running) {
            toast({
                title: 'Waktu Habis',
                description: 'Kamera dinonaktifkan karena tidak ada aktivitas.',
            });
            handleCheckIn(''); // Trigger a failure state
        }
    }, 60000);


    const tick = () => {
      if (!running || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        if (running) requestAnimationFrame(tick)
        return
      }

      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        running = false;
        handleCheckIn(code.data);
        return;
      }
      
      if(running) {
        animationFrameId.current = requestAnimationFrame(tick);
      }
    };
    
    tick();

    return () => {
        running = false;
        if(animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [isScanning, hasCameraPermission, toast, handleCheckIn])

  if (hasCameraPermission === false) {
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
                <AlertDescription>
                    Mohon izinkan akses kamera di pengaturan peramban Anda untuk melanjutkan.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full aspect-video rounded-t-md bg-black" autoPlay muted playsInline />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg" />
        <ScanLine className="h-16 w-full text-white/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
