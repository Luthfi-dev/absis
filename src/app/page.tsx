'use client';

import { BarcodeScanner } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Camera, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScannerPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Perangkat Tidak Didukung',
          description: 'Peramban Anda tidak mendukung akses kamera.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error saat mengakses kamera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Akses Kamera Ditolak',
          description: 'Mohon izinkan akses kamera di pengaturan peramban Anda untuk menggunakan fitur ini.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

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
        
        {/* The video element is required for the scanner to work, but we can hide it */}
        <video ref={videoRef} className="hidden" autoPlay muted playsInline />

        {hasCameraPermission === true && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-green-100/50 text-green-800 rounded-lg h-48 border border-green-200">
            <Camera className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-semibold">Kamera Aktif</h2>
            <p className="text-muted-foreground">Siap untuk memindai ID siswa.</p>
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
        
        <BarcodeScanner />
      </div>
    </div>
  );
}
