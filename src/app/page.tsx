'use client';

import { BarcodeScanner, type ScanResult } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Camera, LogIn, UserCheck, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { CameraFacingMode } from './(app)/settings/page';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ScannerPage() {
  const { toast } = useToast();
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setIsInitializingCamera(true);
    setCameraError(null);
    const savedMode = localStorage.getItem('camera-facing-mode') as CameraFacingMode || 'user';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: savedMode } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError') {
        setCameraError("Mohon izinkan akses kamera di pengaturan peramban Anda untuk melanjutkan.");
      } else {
        setCameraError(`Gagal memulai kamera: ${err.message}. Pastikan tidak digunakan oleh aplikasi lain.`);
      }
      setIsScanning(false);
    } finally {
        setIsInitializingCamera(false);
    }
  }, [stopCamera]);

  const resetState = useCallback(() => {
    setScanResult(null);
    setLastScannedData(null);
    setIsVerifying(false);
  }, []);
  
  const handleScanComplete = useCallback((result: ScanResult) => {
    if (!result.scannedData || isVerifying) return; // Ignore empty scans or if already verifying

    setIsVerifying(true);
    setLastScannedData(result.scannedData);
    
    // Stop scanning visually, but keep camera on for a bit
    setIsScanning(false); 
    
    // Simulate backend verification
    setTimeout(() => {
        stopCamera(); // Stop camera only after verification is done
        setIsVerifying(false);
        setScanResult(result);
        
        if (result.status === 'success') {
          successAudioRef.current?.play().catch(err => console.error("Gagal memutar suara sukses:", err));
        } else {
          errorAudioRef.current?.play().catch(err => console.error("Gagal memutar suara error:", err));
        }
        
        // Show result for 5 seconds then reset
        setTimeout(() => {
          resetState();
        }, 5000);

    }, 1500); // 1.5 second verification delay
  }, [isVerifying, resetState, stopCamera]);
  
  const handleStartScan = () => {
    resetState();
    startCamera();
  }

  const handleCancelScan = () => {
    setIsScanning(false);
    stopCamera();
  }
  
  // Ensure camera is stopped on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


  const renderContent = () => {
    if (isInitializingCamera || isVerifying || isScanning || cameraError) {
      return (
        <Card className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95">
          <CardContent className="p-0 relative">
            <BarcodeScanner 
              videoRef={videoRef}
              onScanComplete={handleScanComplete}
              isScanning={isScanning}
            />
             { (isInitializingCamera || isVerifying) && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 space-y-4 p-4">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="text-xl font-semibold">
                        {isVerifying ? "Memverifikasi Absensi..." : "Memulai kamera..."}
                    </p>
                    {isVerifying && lastScannedData && (
                        <p className="text-sm bg-gray-700/50 px-2 py-1 rounded-md max-w-full truncate">
                            {lastScannedData}
                        </p>
                    )}
                </div>
            )}
            { cameraError && (
                 <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-destructive-foreground z-20 p-4">
                    <Alert variant="destructive" className="border-0">
                        <AlertTriangle className="h-6 w-6" />
                        <AlertTitle className="text-xl">Error Kamera</AlertTitle>
                        <AlertDescription className="text-base">
                            {cameraError}
                        </AlertDescription>
                    </Alert>
                 </div>
            )}
             { (isScanning || cameraError) && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <Button variant="destructive" onClick={handleCancelScan}>Batalkan</Button>
                </div>
             )}
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
                 <h2 className="text-xl font-bold text-destructive">Absensi Gagal</h2>
                 <p className="text-red-600 font-semibold">{scanResult.message}</p>
                 <p className="text-sm text-muted-foreground">{scanResult.timestamp}</p>
                </>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
       <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-2xl">
        <CardContent className="p-0 text-center">
            <div className="p-8 bg-primary/10">
                 <Image 
                    src="https://placehold.co/400x300.png" 
                    alt="Ilustrasi Absensi" 
                    width={400} 
                    height={300} 
                    className="mx-auto rounded-lg transition-transform duration-500 ease-in-out hover:scale-105" 
                    data-ai-hint="student scan"
                    priority
                />
            </div>
            <div className="p-8 space-y-4">
                <h1 className="text-3xl font-bold font-headline animate-pulse-slow">Selamat Datang di AttendEase</h1>
                <p className="text-muted-foreground">Sistem absensi QR code modern. Silakan klik tombol di bawah untuk memulai sesi absensi Anda.</p>
                <Button size="lg" className="h-14 text-xl w-full" onClick={handleStartScan} disabled={isInitializingCamera}>
                    {isInitializingCamera ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Camera className="mr-4 h-8 w-8" />}
                    Mulai Absensi
                </Button>
            </div>
        </CardContent>
       </Card>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <audio ref={successAudioRef} src="https://app.maudigi.com/audio/diterima.mp3" preload="auto" />
       <audio ref={errorAudioRef} src="https://app.maudigi.com/audio/tidakterdaftar.mp3" preload="auto" />
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline" className="bg-background">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Masuk Staf
          </Link>
        </Button>
      </div>
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
