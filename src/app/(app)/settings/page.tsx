
'use client'

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, Trash2, Lock, Unlock, Timer, MessageSquare, Save, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const { toast } = useToast()
  const [cardBackground, setCardBackground] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [isPinEnabled, setIsPinEnabled] = useState(false)
  const [autoScanTimeout, setAutoScanTimeout] = useState('1');
  const [cardLostMessage, setCardLostMessage] = useState('');
  const [checkInTime, setCheckInTime] = useState('07:00');
  const [checkOutTime, setCheckOutTime] = useState('15:00');


  useEffect(() => {
    const savedBackground = localStorage.getItem('card-background')
    if (savedBackground) {
      setCardBackground(savedBackground)
      setPreview(savedBackground)
    }
    const savedPin = localStorage.getItem('scanner-pin') || ''
    setPin(savedPin)
    const savedIsPinEnabled = localStorage.getItem('scanner-pin-enabled') === 'true'
    setIsPinEnabled(savedIsPinEnabled)
    const savedTimeout = localStorage.getItem('auto-scan-timeout') || '1';
    setAutoScanTimeout(savedTimeout);
    const savedMessage = localStorage.getItem('card-lost-message') || 'Jika kartu ini ditemukan, harap kembalikan ke administrasi sekolah.';
    setCardLostMessage(savedMessage);

    const savedCheckInTime = localStorage.getItem('school-check-in-time') || '07:00';
    setCheckInTime(savedCheckInTime);
    const savedCheckOutTime = localStorage.getItem('school-check-out-time') || '15:00';
    setCheckOutTime(savedCheckOutTime);
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        toast({
            variant: "destructive",
            title: "File Terlalu Besar",
            description: "Ukuran gambar latar tidak boleh melebihi 2MB.",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveBackground = () => {
    if (preview) {
      localStorage.setItem('card-background', preview)
      setCardBackground(preview)
      toast({
        title: "Berhasil",
        description: "Latar belakang kartu berhasil disimpan.",
      })
    }
  }

  const handleRemoveBackground = () => {
    localStorage.removeItem('card-background')
    setCardBackground(null)
    setPreview(null)
    toast({
        title: "Berhasil",
        description: "Latar belakang kartu berhasil dihapus.",
      })
  }

  const handlePinSettingsSave = () => {
    localStorage.setItem('scanner-pin', pin)
    localStorage.setItem('scanner-pin-enabled', String(isPinEnabled))
    toast({
      title: "Pengaturan PIN Disimpan",
      description: `PIN halaman absensi telah diperbarui.`
    })
  }

  const handleAutoScanSettingsSave = () => {
    localStorage.setItem('auto-scan-timeout', autoScanTimeout);
    toast({
        title: "Pengaturan Auto-Scan Disimpan",
        description: `Batas waktu auto-scan diatur ke ${autoScanTimeout} menit.`
    });
  }

  const handleCardMessageSave = () => {
    localStorage.setItem('card-lost-message', cardLostMessage);
    toast({
      title: "Pesan Kartu Disimpan",
      description: "Pesan pada bagian belakang kartu siswa telah diperbarui."
    });
  }

  const handleSchoolHoursSave = () => {
    localStorage.setItem('school-check-in-time', checkInTime);
    localStorage.setItem('school-check-out-time', checkOutTime);
    toast({
      title: "Jam Sekolah Disimpan",
      description: `Jam masuk diatur ke ${checkInTime} dan jam pulang diatur ke ${checkOutTime}.`
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan umum untuk aplikasi.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Kustomisasi Kartu Siswa</CardTitle>
            <CardDescription>
              Ubah tampilan dan informasi pada kartu siswa digital.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-background-file">Gambar Latar Belakang Kartu</Label>
              <Input id="card-background-file" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">
                Direkomendasikan ukuran 856x540px. Maksimal 2MB.
              </p>
            </div>

            {preview && (
              <div>
                <Label>Pratinjau</Label>
                <div className="mt-2 w-full max-w-sm rounded-lg border p-4">
                  <Image
                    src={preview}
                    alt="Pratinjau Latar Kartu"
                    width={856}
                    height={540}
                    className="rounded-md object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleSaveBackground} disabled={!preview}>
                <UploadCloud className="mr-2 h-4 w-4" /> Simpan Latar
              </Button>
              {cardBackground && (
                  <Button variant="destructive" onClick={handleRemoveBackground}>
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus Latar
                  </Button>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="card-lost-message" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Pesan Bagian Belakang Kartu
              </Label>
              <Textarea
                id="card-lost-message"
                value={cardLostMessage}
                onChange={(e) => setCardLostMessage(e.target.value)}
                placeholder="cth. Jika kartu ini ditemukan, harap kembalikan..."
                rows={3}
              />
               <Button onClick={handleCardMessageSave}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Pesan
              </Button>
            </div>

          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Keamanan Halaman Absensi</CardTitle>
                    <CardDescription>
                    Aktifkan PIN untuk membatasi akses ke halaman pemindaian dan pengaturannya.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        {isPinEnabled ? <Lock className="h-5 w-5 text-primary" /> : <Unlock className="h-5 w-5 text-muted-foreground" />}
                        <Label htmlFor="pin-enabled" className="font-medium">
                        Aktifkan Verifikasi PIN
                        </Label>
                    </div>
                    <Switch
                    id="pin-enabled"
                    checked={isPinEnabled}
                    onCheckedChange={setIsPinEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="scanner-pin">Atur PIN (4-6 digit)</Label>
                    <Input
                    id="scanner-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // only allow digits
                    maxLength={6}
                    placeholder="••••••"
                    disabled={!isPinEnabled}
                    />
                </div>
                <Button onClick={handlePinSettingsSave} disabled={isPinEnabled && (pin.length < 4 || pin.length > 6)}>
                    Simpan Pengaturan PIN
                </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Pemindai Otomatis</CardTitle>
                    <CardDescription>
                    Atur perilaku mode pemindaian otomatis (auto-scan).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="auto-scan-timeout" className="flex items-center gap-2">
                            <Timer className="h-5 w-5" /> Batas Waktu Auto-Scan (menit)
                        </Label>
                        <Input
                            id="auto-scan-timeout"
                            type="number"
                            value={autoScanTimeout}
                            onChange={(e) => setAutoScanTimeout(e.target.value)}
                            placeholder="cth. 1"
                            min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                            Sesi scan akan berhenti otomatis jika tidak ada aktivitas selama waktu ini.
                        </p>
                    </div>
                    <Button onClick={handleAutoScanSettingsSave}>
                        Simpan Pengaturan Pemindai
                    </Button>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Jam Operasional Sekolah</CardTitle>
                <CardDescription>
                    Atur jam masuk dan pulang untuk menentukan status absensi (tepat waktu, terlambat).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="check-in-time" className="flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Jam Masuk
                    </Label>
                    <Input
                        id="check-in-time"
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="check-out-time" className="flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Jam Pulang
                    </Label>
                    <Input
                        id="check-out-time"
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                    />
                </div>
                <Button onClick={handleSchoolHoursSave}>
                    Simpan Jam Sekolah
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
