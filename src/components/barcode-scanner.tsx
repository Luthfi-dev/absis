
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { ScanLine, Loader2 } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"
import jsQR from "jsqr"
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
  setCameraError: (error: string | null) => void;
}

export function BarcodeScanner({ onScanComplete, isScanning, setCameraError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number>()
  const [isInitializing, setIsInitializing] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = undefined;
    }
  }, []);

  const handleCheckIn = useCallback((scannedData: string) => {
    if (!isScanning) return;

    let studentId: string;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;
    
    if (scannedData.length < 5) {
        return; 
    }

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
  }, [onScanComplete, isScanning]);
  
  useEffect(() => {
    const startCamera = async () => {
      setIsInitializing(true);
      setCameraError(null);
      const savedMode = localStorage.getItem('camera-facing-mode') as CameraFacingMode || 'environment';

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: savedMode } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (err.name === 'NotAllowedError') {
          setCameraError("Mohon izinkan akses kamera di pengaturan peramban Anda untuk melanjutkan.");
        } else {
          setCameraError(`Gagal memulai kamera: ${err.message}. Pastikan tidak digunakan oleh aplikasi lain.`);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, setCameraError, stopCamera]);


  useEffect(() => {
    const tick = () => {
      if (isScanning && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if(canvas) {
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
              // Ignore getImageData errors which can happen if canvas is not ready
            }
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    if (isScanning && !isInitializing) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, isInitializing, handleCheckIn]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
      
      {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/70 z-30">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Memulai kamera...</p>
          </div>
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {isScanning && !isInitializing && (
          <>
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg" style={{ boxSizing: 'border-box' }}/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-px bg-red-500 animate-scan-y shadow-lg" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-white text-center p-3 rounded-lg animate-pulse-slow">
              <p className="font-medium">Arahkan QR Code Kartu Siswa ke Kamera</p>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
