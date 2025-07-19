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
import { UploadCloud, Trash2, Camera, Smartphone, Lock, Unlock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

export type CameraFacingMode = "user" | "environment"

export default function SettingsPage() {
  const { toast } = useToast()
  const [cardBackground, setCardBackground] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cameraMode, setCameraMode] = useState<CameraFacingMode>('user')
  const [pin, setPin] = useState('')
  const [isPinEnabled, setIsPinEnabled] = useState(false)

  useEffect(() => {
    const savedBackground = localStorage.getItem('card-background')
    if (savedBackground) {
      setCardBackground(savedBackground)
      setPreview(savedBackground)
    }
    const savedCameraMode = localStorage.getItem('camera-facing-mode') as CameraFacingMode | null
    if (savedCameraMode) {
        setCameraMode(savedCameraMode)
    }
    const savedPin = localStorage.getItem('scanner-pin') || ''
    setPin(savedPin)
    const savedIsPinEnabled = localStorage.getItem('scanner-pin-enabled') === 'true'
    setIsPinEnabled(savedIsPinEnabled)
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

  const handleCameraModeChange = (value: CameraFacingMode) => {
    setCameraMode(value)
    localStorage.setItem('camera-facing-mode', value)
    toast({
        title: "Pengaturan Disimpan",
        description: `Kamera pemindai diatur ke kamera ${value === 'user' ? 'depan' : 'belakang'}.`,
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan umum untuk aplikasi.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Kustomisasi Kartu Siswa</CardTitle>
            <CardDescription>
              Unggah gambar latar belakang untuk kartu siswa digital.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-background-file">File Gambar Latar</Label>
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
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Pemindai</CardTitle>
                <CardDescription>
                Pilih kamera default yang akan digunakan untuk memindai QR code.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup value={cameraMode} onValueChange={handleCameraModeChange}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="front-camera" />
                        <Label htmlFor="front-camera" className="flex items-center gap-2">
                            <Camera className="h-5 w-5" /> Kamera Depan (Selfie)
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="environment" id="back-camera" />
                        <Label htmlFor="back-camera" className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" /> Kamera Belakang (Utama)
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Keamanan Halaman Absensi</CardTitle>
                <CardDescription>
                  Aktifkan PIN untuk membatasi akses ke halaman pemindaian absensi.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    {isPinEnabled ? <Lock className="h-5 w-5 text-primary" /> : <Unlock className="h-5 w-5 text-muted-foreground" />}
                    <Label htmlFor="pin-enabled" className="font-medium">
                      Aktifkan PIN
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
      </div>
    </div>
  )
}
