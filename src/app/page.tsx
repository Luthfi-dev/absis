'use client';

import { BarcodeScanner, type ScanResult } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Camera, LogIn, UserCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ScannerPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cleanupAndReset = useCallback(() => {
    stopCamera();
    setIsScanning(false);
    setScanResult(null);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Perangkat Tidak Didukung',
        description: 'Peramban Anda tidak mendukung akses kamera.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsScanning(true);
      setScanResult(null);

      // Set timeout to close camera after 1 minute of inactivity
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toast({
          title: 'Waktu Habis',
          description: 'Kamera dinonaktifkan karena tidak ada aktivitas.',
        });
        cleanupAndReset();
      }, 60000); // 1 minute
    } catch (error) {
      console.error('Error saat mengakses kamera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Akses Kamera Ditolak',
        description: 'Mohon izinkan akses kamera di pengaturan peramban Anda.',
      });
    }
  }, [toast, cleanupAndReset]);

  useEffect(() => {
    // Check for permission on mount without activating camera
    const checkPermission = async () => {
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissions.state === 'granted') {
          setHasCameraPermission(true);
        } else if (permissions.state === 'denied') {
          setHasCameraPermission(false);
        } else {
            setHasCameraPermission(null);
        }
      } catch (error) {
        // This can happen on non-secure contexts or unsupported browsers
        setHasCameraPermission(false);
      }
    };
    checkPermission();

    // Cleanup on unmount
    return () => {
      cleanupAndReset();
    };
  }, [cleanupAndReset]);

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    if (result.status === 'success' && audioRef.current) {
      audioRef.current.play();
    }
    // Stop camera and reset after showing result for 5 seconds
    setTimeout(() => {
      cleanupAndReset();
    }, 5000);
  };

  const renderContent = () => {
    if (isScanning) {
        if (hasCameraPermission === false) {
             return (
                <Alert variant="destructive" className="h-48">
                    <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
                    <AlertDescription>
                    Mohon izinkan akses kamera untuk menggunakan fitur ini. Periksa pengaturan peramban Anda.
                    </AlertDescription>
                </Alert>
             )
        }
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-0">
             <video ref={videoRef} className="w-full aspect-video rounded-t-md bg-black" autoPlay muted playsInline />
            <div className="p-6">
              <BarcodeScanner onScanComplete={handleScanComplete} />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (scanResult) {
      return (
        <Card className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scanResult.status === 'success' ? <UserCheck className="text-green-500" /> : <XCircle className="text-red-500" />}
              Status Absensi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            {scanResult.status === 'success' && scanResult.student ? (
              <>
                <Avatar className="w-24 h-24 border-4 border-green-500">
                  <AvatarImage src={scanResult.student.avatar} alt={scanResult.student.name} />
                  <AvatarFallback className="text-3xl">{scanResult.student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{scanResult.student.name}</h2>
                <Badge variant="outline">{scanResult.student.studentId}</Badge>
                <p className="text-green-600 font-semibold">{scanResult.message}</p>
                <p className="text-sm text-muted-foreground">{scanResult.timestamp}</p>
              </>
            ) : (
                <>
                 <XCircle className="w-24 h-24 text-red-500" />
                 <p className="text-red-600 font-semibold">{scanResult.message}</p>
                </>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="text-center">
        <Button size="lg" className="h-24 w-64 text-2xl" onClick={startCamera} disabled={hasCameraPermission === false}>
          <Camera className="mr-4 h-8 w-8" />
          Mulai Absensi
        </Button>
        {hasCameraPermission === false && (
            <p className="text-red-500 mt-4 text-sm">Akses kamera ditolak. Mohon aktifkan di pengaturan peramban.</p>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <audio ref={audioRef} src="/success.mp3" preload="auto" />
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Masuk Admin
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
}
