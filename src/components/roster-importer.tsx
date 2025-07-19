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
        title: "No file selected",
        description: "Please select a CSV file to analyze.",
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
          title: "Analysis Failed",
          description: result.error || "An unknown error occurred.",
        })
      }
      setIsLoading(false)
    }
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
          })
        setIsLoading(false)
    }
    reader.readAsText(file)
  }
  
  const handleImport = () => {
    // In a real app, you would now parse the CSV with the mapping and save to DB
    toast({
        title: "Import Successful",
        description: "Student roster has been imported.",
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
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Import Roster
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Import Student Roster</DialogTitle>
          <DialogDescription>
            Upload a CSV file. We'll use AI to automatically map the columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {!analysisResult ? (
                <>
                <div className="space-y-2">
                    <Label htmlFor="roster-file">CSV File</Label>
                    <Input id="roster-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                </>
            ) : (
                <div>
                    <h4 className="font-medium mb-2">Suggested Column Mapping</h4>
                    <p className="text-sm text-muted-foreground mb-4">Please review the AI-suggested mappings before importing.</p>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CSV Column</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead>Student Field</TableHead>
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
                <Button variant="outline" onClick={resetState}>Cancel</Button>
            </DialogClose>
            {!analysisResult ? (
                 <Button onClick={handleAnalyze} disabled={!file || isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}
                    Analyze
                </Button>
            ) : (
                <Button onClick={handleImport}>
                    Confirm and Import
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
