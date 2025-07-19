'use client';

import { BarcodeScanner, type ScanResult } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { UserCheck, XCircle, Loader2, X, ScanLine, CameraOff, Camera } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PinDialog } from '@/components/pin-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScannerPage() {
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [isPinRequired, setIsPinRequired] = useState<boolean | undefined>(undefined);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinDialogAction, setPinDialogAction] = useState<'open' | 'close'>('open');
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);


  useEffect(() => {
    const pinEnabled = localStorage.getItem('scanner-pin-enabled') === 'true';
    setIsPinRequired(pinEnabled);
    if (!pinEnabled) {
      setIsUnlocked(true);
    } else {
      setShowPinDialog(true);
      setPinDialogAction('open');
    }
  }, []);

  const resetState = useCallback(() => {
    setScanResult(null);
    setLastScannedData(null);
    setIsVerifying(false);
    setCameraError(null);
    setIsScanning(false); // Kembali ke halaman intro setelah selesai
  }, []);
  
  const handleScanComplete = useCallback((result: ScanResult) => {
    if (!result.scannedData || isVerifying) return;

    setIsVerifying(true);
    setLastScannedData(result.scannedData);
    
    setTimeout(() => {
        setIsVerifying(false);
        setScanResult(result);
        
        if (result.status === 'success') {
          successAudioRef.current?.play().catch(err => console.error("Gagal memutar suara sukses:", err));
        } else {
          errorAudioRef.current?.play().catch(err => console.error("Gagal memutar suara error:", err));
        }
        
        setTimeout(() => {
          resetState();
        }, 5000);

    }, 1500);
  }, [isVerifying, resetState]);

  const handleClosePage = () => {
    if (isPinRequired) {
      setShowPinDialog(true);
      setPinDialogAction('close');
    } else {
      router.push('/');
    }
  };

  const onPinSuccess = () => {
    if (pinDialogAction === 'open') {
      setIsUnlocked(true);
      setShowPinDialog(false);
    } else { // 'close'
      router.push('/');
    }
  };

  const renderContent = () => {
    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-white" />
                <p className="text-xl font-semibold text-white">Memuat Halaman Absensi...</p>
                <p className="text-muted-foreground">Menunggu otentikasi PIN.</p>
            </div>
        )
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
    
    if (isScanning) {
        return (
            <Card className="w-full h-full sm:w-full sm:h-auto sm:max-w-md mx-auto animate-in fade-in zoom-in-95 flex flex-col">
                <CardContent className="p-0 relative flex-grow">
                <BarcodeScanner 
                    onScanComplete={handleScanComplete}
                    setCameraError={setCameraError}
                    isPaused={isVerifying || !!scanResult}
                />
                 { isVerifying && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 space-y-4 p-4">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="text-xl font-semibold">Memverifikasi Absensi...</p>
                        {lastScannedData && (
                            <p className="text-sm bg-gray-700/50 px-2 py-1 rounded-md max-w-full truncate">
                                {lastScannedData}
                            </p>
                        )}
                    </div>
                )}
                { cameraError && (
                     <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-destructive-foreground z-20 p-4 text-center">
                        <Alert variant="destructive" className="border-0">
                            <AlertTriangle className="h-6 w-6" />
                            <AlertTitle className="text-xl">Error Kamera</AlertTitle>
                            <AlertDescription className="text-base">
                                {cameraError}
                            </AlertDescription>
                        </Alert>
                     </div>
                )}
                </CardContent>
                 <div className="p-4 bg-background border-t">
                    <Button variant="outline" className="w-full" onClick={() => setIsScanning(false)}>
                        <CameraOff className="mr-2 h-4 w-4" />
                        Batalkan Pemindaian
                    </Button>
                </div>
            </Card>
          );
    }

    return (
        <Card className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <ScanLine className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">Halaman Absensi</CardTitle>
                <CardDescription>
                    Halaman ini siap untuk memulai sesi absensi. Klik tombol di bawah untuk mengaktifkan kamera.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" className="w-full" onClick={() => setIsScanning(true)}>
                    <Camera className="mr-2 h-5 w-5" />
                    Mulai Absensi
                </Button>
            </CardContent>
        </Card>
    )
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
       <audio ref={successAudioRef} src="https://app.maudigi.com/audio/diterima.mp3" preload="auto" />
       <audio ref={errorAudioRef} src="https://app.maudigi.com/audio/tidakterdaftar.mp3" preload="auto" />

        {isUnlocked && (
            <div className="absolute top-4 right-4 z-50">
                <Button variant="destructive" size="icon" onClick={handleClosePage} className="rounded-full h-12 w-12 p-0">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Tutup Halaman Absensi</span>
                </Button>
            </div>
        )}

        <div className="w-full h-screen sm:h-auto sm:max-w-md flex items-center justify-center">
            {renderContent()}
        </div>
        
        {isPinRequired !== undefined && (
          <PinDialog 
            isOpen={showPinDialog}
            onClose={() => {
                setShowPinDialog(false)
                if(pinDialogAction === 'open' && !isUnlocked) router.push('/')
            }}
            onSuccess={onPinSuccess}
            action={pinDialogAction}
          />
        )}
    </div>
  );
}
