'use client';

import { BarcodeScanner } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Camera, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScannerPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const getCameraPermission = useCallback(async (showToast = true) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (showToast) {
        toast({
          variant: 'destructive',
          title: 'Perangkat Tidak Didukung',
          description: 'Peramban Anda tidak mendukung akses kamera.',
        });
      }
      setHasCameraPermission(false);
      setIsCameraActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error saat mengakses kamera:', error);
      setHasCameraPermission(false);
      setIsCameraActive(false);
      if (showToast) {
        toast({
          variant: 'destructive',
          title: 'Akses Kamera Ditolak',
          description: 'Mohon izinkan akses kamera di pengaturan peramban Anda untuk menggunakan fitur ini.',
        });
      }
    }
  }, [toast]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    }
  };

  const startCamera = () => {
    if (!isCameraActive && hasCameraPermission) {
      getCameraPermission(false);
    }
  };

  useEffect(() => {
    getCameraPermission();
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Masuk Admin
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {hasCameraPermission === null && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-muted rounded-lg h-48">
                <p className="text-muted-foreground">Meminta izin kamera...</p>
            </div>
        )}
        
        <video ref={videoRef} className="hidden" autoPlay muted playsInline />

        {hasCameraPermission === true && (
            <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg h-48 border transition-colors ${isCameraActive ? 'bg-green-100/50 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                <Camera className={`h-12 w-12 mb-4 transition-colors ${isCameraActive ? 'text-green-500' : 'text-gray-400'}`} />
                <h2 className="text-xl font-semibold">{isCameraActive ? 'Kamera Aktif' : 'Kamera Siaga'}</h2>
                <p className="text-muted-foreground">{isCameraActive ? 'Siap untuk memindai ID siswa.' : 'Ketik untuk mengaktifkan kamera.'}</p>
            </div>
        )}

        {hasCameraPermission === false && (
          <Alert variant="destructive" className="h-48">
            <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
            <AlertDescription>
              Mohon izinkan akses kamera untuk menggunakan fitur ini. Periksa pengaturan peramban Anda.
            </AlertDescription>
          </Alert>
        )}
        
        <BarcodeScanner onScanComplete={stopCamera} onInputChange={startCamera} />
      </div>
    </div>
  );
}
