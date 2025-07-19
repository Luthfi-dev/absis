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
};

type BarcodeScannerProps = {
  onScanComplete: (result: ScanResult) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isScanning: boolean;
}

export function BarcodeScanner({ onScanComplete, videoRef, isScanning }: BarcodeScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const handleCheckIn = useCallback((encryptedStudentId: string) => {
    if (!encryptedStudentId || encryptedStudentId.trim() === "" || encryptedStudentId.length < 4) {
        return;
    }
    
    let studentId: string;
    try {
      // In a real app, this would be a more robust decryption method.
      // Using Base64 for simulation.
      studentId = atob(encryptedStudentId);
    } catch (e) {
      console.error("Failed to decode QR code:", e);
      // Don't show an error to the user, just ignore invalid QR codes.
      return;
    }


    const student = mockStudents.find(s => s.id === studentId);
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
            message: `Siswa dengan ID terenkripsi tidak ditemukan.`,
            timestamp: timestamp,
        });
    }
  }, [onScanComplete]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let localIsScanning = isScanning;

    if (!localIsScanning || !video || !canvas) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    const tick = () => {
      if (!localIsScanning) {
         if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
         return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          localIsScanning = false;
          handleCheckIn(code.data);
          return; // Stop the loop once a code is found
        }
      }
      if(localIsScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
      }
    };

    const startScan = () => {
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            tick();
        } else {
            video.oncanplay = () => {
                tick();
            };
        }
    }
    
    startScan();

    return () => {
      localIsScanning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if(video) video.oncanplay = null;
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
