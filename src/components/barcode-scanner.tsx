
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
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
  setCameraError: (error: string | null) => void;
  isPaused: boolean;
}

export function BarcodeScanner({ onScanComplete, setCameraError, isPaused }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number>()
  const [isInitializing, setIsInitializing] = useState(true);

  const handleCheckIn = useCallback((scannedData: string) => {
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
  }, [onScanComplete]);
  
  useEffect(() => {
    let isActive = true;

    const startCamera = async () => {
      setIsInitializing(true);
      setCameraError(null);
      
      const savedMode = localStorage.getItem('camera-facing-mode') as CameraFacingMode || 'environment';

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: savedMode } });
        if (isActive) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setIsInitializing(false);
          startScanLoop();
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

    const stopScanLoop = () => {
        if(animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current)
            animationFrameId.current = undefined
        }
    }

    const startScanLoop = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        const tick = () => {
          if (isPaused) {
            animationFrameId.current = requestAnimationFrame(tick);
            return;
          }
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
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
        animationFrameId.current = requestAnimationFrame(tick);
    }
    
    startCamera();

    return () => {
      isActive = false;
      stopScanLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaused) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
    }
  }, [isPaused])

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
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg" style={{ boxSizing: 'border-box' }}/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[280px] h-px bg-red-500 animate-scan-y shadow-lg" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-white text-center p-3 rounded-lg animate-pulse-slow">
              <p className="font-medium">Arahkan QR Code Kartu Siswa ke Kamera</p>
            </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
