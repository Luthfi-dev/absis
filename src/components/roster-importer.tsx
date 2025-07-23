
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importRosterAction } from "@/app/actions"
import { Loader2, Upload, FileCheck2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

type RosterImportOutput = {
    columnMapping: Record<string, string>;
}

export function RosterImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<RosterImportOutput | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setAnalysisResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Tidak ada file yang dipilih",
        description: "Silakan pilih file CSV untuk dianalisis.",
      })
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const csvData = e.target?.result as string
      const result = await importRosterAction({ csvData })
      if (result.success && result.data) {
        setAnalysisResult(result.data)
      } else {
        toast({
          variant: "destructive",
          title: "Analisis Gagal",
          description: result.error || "Terjadi kesalahan yang tidak diketahui.",
        })
      }
      setIsLoading(false)
    }
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Kesalahan Membaca File",
            description: "Tidak dapat membaca file yang dipilih.",
          })
        setIsLoading(false)
    }
    reader.readAsText(file)
  }
  
  const handleImport = () => {
    // Di aplikasi nyata, Anda sekarang akan mengurai CSV dengan pemetaan dan menyimpannya ke DB
    toast({
        title: "Impor Berhasil",
        description: "Daftar nama siswa telah diimpor.",
      })
    resetState()
  }

  const resetState = () => {
    setFile(null)
    setIsLoading(false)
    setAnalysisResult(null)
    setIsOpen(false)
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="sm:w-auto w-10 p-0 sm:px-4 sm:py-2">
            <Upload />
            <span className="sr-only sm:not-sr-only sm:ml-2">Impor Daftar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Impor Daftar Siswa</DialogTitle>
          <DialogDescription>
            Unggah file CSV. Kami akan menggunakan AI untuk memetakan kolom secara otomatis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {!analysisResult ? (
                <>
                <div className="space-y-2">
                    <Label htmlFor="roster-file">File CSV</Label>
                    <Input id="roster-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                {file && <p className="text-sm text-muted-foreground">Terpilih: {file.name}</p>}
                </>
            ) : (
                <div>
                    <h4 className="font-medium mb-2">Pemetaan Kolom yang Disarankan</h4>
                    <p className="text-sm text-muted-foreground mb-4">Harap tinjau pemetaan yang disarankan AI sebelum mengimpor.</p>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kolom CSV</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead>Field Siswa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(analysisResult.columnMapping).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium">{value}</TableCell>
                                        <TableCell><ArrowRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                                        <TableCell className="capitalize">{key}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={resetState}>Batal</Button>
            </DialogClose>
            {!analysisResult ? (
                 <Button onClick={handleAnalyze} disabled={!file || isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}
                    Analisis
                </Button>
            ) : (
                <Button onClick={handleImport}>
                    Konfirmasi dan Impor
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
