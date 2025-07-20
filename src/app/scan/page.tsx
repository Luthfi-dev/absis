
'use client';

import { BarcodeScanner, type ScanResult } from '@/components/barcode-scanner';
import { Button } from '@/components/ui/button';
import { UserCheck, XCircle, Loader2, X, ScanLine, CameraOff, Camera, Repeat, RefreshCw, Settings } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PinDialog } from '@/components/pin-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CameraFacingMode } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';


type PinAction = 'open' | 'close' | 'switch-camera' | 'toggle-auto-scan';

export default function ScannerPage() {
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [isPinRequired, setIsPinRequired] = useState<boolean | undefined>(undefined);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinDialogAction, setPinDialogAction] = useState<PinAction>('open');
  const router = useRouter();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment');
  const [isAutoScan, setIsAutoScan] = useState(false);
  const [autoScanTimeoutMinutes, setAutoScanTimeoutMinutes] = useState(1);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);


  useEffect(() => {
    // Load settings from localStorage
    const pinEnabled = localStorage.getItem('scanner-pin-enabled') === 'true';
    setIsPinRequired(pinEnabled);
    if (!pinEnabled) {
      setIsUnlocked(true);
    } else {
      setShowPinDialog(true);
      setPinDialogAction('open');
    }

    const savedTimeout = parseInt(localStorage.getItem('auto-scan-timeout') || '1', 10);
    setAutoScanTimeoutMinutes(savedTimeout);
    
    const savedFacingMode = localStorage.getItem('scanner-facing-mode') as CameraFacingMode | null;
    if (savedFacingMode) setFacingMode(savedFacingMode);
    
    const savedAutoScan = localStorage.getItem('scanner-auto-scan') === 'true';
    setIsAutoScan(savedAutoScan);

  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (isScanning && isAutoScan) {
      idleTimerRef.current = setTimeout(() => {
        toast({ title: 'Sesi Auto-Scan Berakhir', description: 'Sesi ditutup karena tidak ada aktivitas.' });
        setIsScanning(false);
      }, autoScanTimeoutMinutes * 60 * 1000);
    }
  }, [isScanning, isAutoScan, autoScanTimeoutMinutes, toast]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);
  
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
        
        if (isAutoScan) {
          setTimeout(() => {
            setScanResult(null);
            setLastScannedData(null);
            resetIdleTimer(); // Reset timer on new scan
          }, 3000);
        } else {
          setTimeout(() => {
            setIsScanning(false); // Kembali ke halaman intro setelah selesai jika bukan auto-scan
            setScanResult(null);
            setLastScannedData(null);
          }, 5000);
        }

    }, 1500);
  }, [isVerifying, isAutoScan, resetIdleTimer]);

  const handleClosePage = () => {
    if (isPinRequired) {
      setPinDialogAction('close');
      setShowPinDialog(true);
    } else {
      router.push('/');
    }
  };

  const executeCameraSwitch = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    localStorage.setItem('scanner-facing-mode', newMode);
    toast({ title: `Kamera diubah ke ${newMode === 'user' ? 'depan (selfie)' : 'belakang (utama)'}` });
    // If scanning, we need to stop and restart to apply camera change
    if(isScanning) {
        setIsScanning(false);
        setTimeout(() => setIsScanning(true), 100);
    }
  };

  const executeAutoScanToggle = () => {
    const newAutoScanState = !isAutoScan;
    setIsAutoScan(newAutoScanState);
    localStorage.setItem('scanner-auto-scan', String(newAutoScanState));
    toast({ title: `Mode Auto-Scan ${newAutoScanState ? 'Aktif' : 'Nonaktif'}` });
  };


  const onPinSuccess = () => {
    setShowPinDialog(false);
    if (pinDialogAction === 'open') {
      setIsUnlocked(true);
    } else if (pinDialogAction === 'close') {
      router.push('/');
    } else if (pinDialogAction === 'switch-camera') {
      executeCameraSwitch();
    } else if (pinDialogAction === 'toggle-auto-scan') {
      executeAutoScanToggle();
    }
  };
  
  const handleControlClick = (action: 'switch-camera' | 'toggle-auto-scan') => {
    if (isPinRequired) {
      setPinDialogAction(action);
      setShowPinDialog(true);
    } else {
      if (action === 'switch-camera') {
        executeCameraSwitch();
      } else if (action === 'toggle-auto-scan') {
        executeAutoScanToggle();
      }
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

    if (scanResult && (!isAutoScan || isVerifying)) {
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
                    key={facingMode} // Force re-mount on camera change
                    onScanComplete={handleScanComplete}
                    setCameraError={setCameraError}
                    isPaused={isVerifying || !!scanResult}
                    facingMode={facingMode}
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
                 {scanResult && isAutoScan && !isVerifying && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 space-y-4 p-4">
                      {scanResult.status === 'success' ? <UserCheck className="w-12 h-12 text-green-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
                      <p className="text-xl font-semibold">{scanResult.message}</p>
                      <p className="text-lg font-bold">{scanResult.student?.name}</p>
                      <Loader2 className="w-6 h-6 animate-spin mt-4" />
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
                    <Button variant="outline" className="w-full" onClick={() => { setIsScanning(false); }}>
                        <CameraOff className="mr-2 h-4 w-4" />
                        Hentikan Sesi
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
                    Pindai QR Code pada kartu siswa untuk mencatat kehadiran.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" className="w-full" onClick={() => { setIsScanning(true); resetIdleTimer(); }}>
                    <Camera className="mr-2 h-5 w-5" />
                    Mulai Absensi
                </Button>
            </CardContent>
        </Card>
    )
  };

  const SettingsDialog = () => (
    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pengaturan Pemindai</DialogTitle>
                <DialogDescription>
                    Atur perilaku pemindai absensi. Perlu verifikasi PIN jika diaktifkan.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="auto-scan-mode" className="flex flex-col gap-1">
                        <span>Mode Auto-Scan</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            Pemindai akan aktif terus setelah setiap pemindaian.
                        </span>
                    </Label>
                    <Switch
                        id="auto-scan-mode"
                        checked={isAutoScan}
                        onCheckedChange={() => handleControlClick('toggle-auto-scan')}
                    />
                </div>
                 <Button variant="outline" className="w-full" onClick={() => handleControlClick('switch-camera')}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Ganti ke Kamera {facingMode === 'user' ? 'Belakang' : 'Depan'}
                </Button>
            </div>
            <DialogFooter>
                <Button onClick={() => setShowSettingsDialog(false)}>Tutup</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
       <audio ref={successAudioRef} src="https://app.maudigi.com/audio/diterima.mp3" preload="auto" />
       <audio ref={errorAudioRef} src="https://app.maudigi.com/audio/tidakterdaftar.mp3" preload="auto" />

        {isUnlocked && (
            <>
                <div className="absolute top-4 left-4 z-50">
                     <Button variant="secondary" size="icon" onClick={() => setShowSettingsDialog(true)} className="rounded-full h-12 w-12 p-0">
                        <Settings className="h-6 w-6" />
                        <span className="sr-only">Buka Pengaturan</span>
                    </Button>
                </div>
                <div className="absolute top-4 right-4 z-50">
                    <Button variant="destructive" size="icon" onClick={handleClosePage} className="rounded-full h-12 w-12 p-0">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Tutup Halaman Absensi</span>
                    </Button>
                </div>
            </>
        )}

        <div className="w-full h-screen sm:h-auto sm:max-w-md flex items-center justify-center">
            {renderContent()}
        </div>
        
        <SettingsDialog />

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
