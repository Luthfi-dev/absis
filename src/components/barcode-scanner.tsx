"use client"

import { useEffect, useRef, useCallback } from "react"
import { ScanLine } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"
import jsQR from "jsqr"

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
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function BarcodeScanner({ onScanComplete, isScanning, videoRef }: BarcodeScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()

  const handleCheckIn = useCallback((scannedData: string) => {
    let studentId: string;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;
    
    // Ignore obviously invalid QR codes
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
    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if(canvas) {
          const context = canvas.getContext("2d", { willReadFrequently: true });
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
              // Do not return here, let the parent component stop the scan
            }
          }
        }
      }
      if(isScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
      }
    };

    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };
  }, [isScanning, handleCheckIn, videoRef]);

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full aspect-video rounded-t-md bg-black" autoPlay muted playsInline />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {isScanning && (
          <>
            <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-lg" />
            <ScanLine className="h-16 w-full text-white/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
