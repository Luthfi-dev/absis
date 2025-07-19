"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { ScanLine, AlertTriangle, CameraOff } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"
import jsQR from "jsqr"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import type { CameraFacingMode } from "@/app/(app)/settings/page"

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraMode, setCameraMode] = useState<CameraFacingMode>('user')
  
  useEffect(() => {
    const savedMode = localStorage.getItem('camera-facing-mode') as CameraFacingMode | null
    if (savedMode) {
      setCameraMode(savedMode)
    }
  }, [])

  const cleanupScanner = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  },[]);

  const handleCheckIn = useCallback((scannedData: string) => {
    let studentId: string;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;
    
    try {
      if (scannedData.length < 5) return;
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
            message: "Absensi diterima.",
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
  
  useEffect(() => {
    if (!isScanning) {
      cleanupScanner();
      return;
    }

    let stream: MediaStream | null = null;
    let animationFrame: number;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraMode } });
        setHasCameraPermission(true);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          tick();
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        if (err.name === 'NotAllowedError') {
            setCameraError("Mohon izinkan akses kamera di pengaturan peramban Anda untuk melanjutkan.");
        } else {
            setCameraError("Gagal memulai kamera. Pastikan tidak digunakan oleh aplikasi lain atau coba kamera lain di pengaturan.");
        }
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if(canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              handleCheckIn(code.data);
              return; 
            }
          }
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    startScanner();

    return () => {
      cleanupScanner();
    };
  }, [isScanning, cameraMode, handleCheckIn, cleanupScanner]);
  
  if (hasCameraPermission === null && isScanning) {
    return (
        <div className="flex flex-col items-center justify-center p-6 aspect-video bg-muted rounded-t-md">
            <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Meminta izin kamera...</p>
        </div>
    )
  }

  if (hasCameraPermission === false && cameraError) {
    return (
        <div className="p-6 aspect-video bg-destructive/10 rounded-t-md">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Kamera</AlertTitle>
                <AlertDescription>
                    {cameraError}
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
