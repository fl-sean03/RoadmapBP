"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import mammoth from 'mammoth'

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void
  isGenerating: boolean
}

export function FileUpload({ onFileContent, isGenerating }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [fileContent, setFileContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load PDF.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      if (!window.pdfjsLib) {
        throw new Error("PDF.js library not loaded")
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ""
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map((item: any) => item.str)
        text += strings.join(" ") + "\n"
      }
      
      return text
    } catch (err) {
      console.error("Error extracting PDF text:", err)
      throw new Error("Failed to extract text from PDF file")
    }
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (err) {
      console.error("Error extracting DOCX text:", err)
      throw new Error("Failed to extract text from DOCX file")
    }
  }

  const handleFile = async (file: File) => {
    setError("")
    setFileContent("")

    // Check file type
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".docx")) {
      setError("Please upload a PDF, DOCX, or TXT file.")
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.")
      return
    }

    try {
      let content = ""

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        content = await file.text()
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        content = await extractTextFromPDF(file)
      } else if (file.name.endsWith(".docx")) {
        content = await extractTextFromDOCX(file)
      }

      if (content.trim()) {
        setFileContent(content)
        onFileContent(content, file.name)
      } else {
        setError("The file appears to be empty or could not be read.")
      }
    } catch (err) {
      console.error("Error processing file:", err)
      setError("Error reading file. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className={`h-6 w-6 ${dragActive ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
          <p className="text-sm font-medium">{dragActive ? "Drop your file here" : "Upload a file"}</p>
          <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT files (max 10MB)</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
