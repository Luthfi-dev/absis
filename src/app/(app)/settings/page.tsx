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
import { UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function SettingsPage() {
  const { toast } = useToast()
  const [cardBackground, setCardBackground] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    // Load saved background from localStorage on component mount
    const savedBackground = localStorage.getItem('card-background')
    if (savedBackground) {
      setCardBackground(savedBackground)
      setPreview(savedBackground)
    }
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

  const handleSave = () => {
    if (preview) {
      localStorage.setItem('card-background', preview)
      setCardBackground(preview)
      toast({
        title: "Berhasil",
        description: "Latar belakang kartu berhasil disimpan.",
      })
    } else {
        toast({
            variant: "destructive",
            title: "Tidak ada gambar",
            description: "Silakan pilih gambar terlebih dahulu.",
        })
    }
  }

  const handleRemove = () => {
    localStorage.removeItem('card-background')
    setCardBackground(null)
    setPreview(null)
    toast({
        title: "Berhasil",
        description: "Latar belakang kartu berhasil dihapus.",
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
            <div className="flex items-center gap-4">
              <Input id="card-background-file" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="max-w-xs" />
            </div>
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
            <Button onClick={handleSave} disabled={!preview}>
              <UploadCloud className="mr-2 h-4 w-4" /> Simpan Latar
            </Button>
            {cardBackground && (
                <Button variant="destructive" onClick={handleRemove}>
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus Latar
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
