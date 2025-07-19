"use client"

import { useEffect, useRef } from "react"
import { ScanLine } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"
import jsQR from "jsqr"

export type ScanResult = {
  status: "success" | "error";
  message: string;
  student?: Student;
  timestamp?: string;
};

type BarcodeScannerProps = {
  onScanComplete: (result: ScanResult) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isScanning: boolean;
}

export function BarcodeScanner({ onScanComplete, videoRef, isScanning }: BarcodeScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const handleCheckIn = (studentId: string) => {
    if (studentId.trim() === "") {
        return
    }

    const student = mockStudents.find(s => s.studentId.toLowerCase() === studentId.toLowerCase());
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;

    if (student) {
        onScanComplete({
            status: "success",
            message: "Berhasil melakukan absensi.",
            student: student,
            timestamp: timestamp,
        });
    } else {
        onScanComplete({
            status: "error",
            message: `ID Siswa ${studentId.toUpperCase()} tidak ditemukan.`,
            timestamp: timestamp,
        });
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isScanning || !video || !canvas) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          handleCheckIn(code.data);
          return; 
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, videoRef, handleCheckIn]);


  return (
    <div className="space-y-4 text-center">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-medium">Arahkan QR Code ke Kamera</h3>
        <p className="text-sm text-muted-foreground">
            Absensi akan tercatat secara otomatis.
        </p>
      </div>
  )
}
