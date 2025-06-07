"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, File, AlertCircle, Sparkles, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import mammoth from 'mammoth'

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface FileUploadProps {
  onFileContent: (content: string) => void
  isGenerating: boolean
}

export function FileUpload({ onFileContent, isGenerating }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewContent, setPreviewContent] = useState("")
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
    setPreviewContent("")
    setSelectedFile(file)

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
        // Create a preview of the content (first 500 characters)
        setPreviewContent(content.slice(0, 500) + (content.length > 500 ? "..." : ""))
      } else {
        setError("The file appears to be empty or could not be read.")
      }
    } catch (err) {
      console.error("Error processing file:", err)
      setError("Error reading file. Please try again.")
    }
  }

  const handleSubmit = () => {
    if (fileContent.trim()) {
      onFileContent(fileContent)
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileContent("")
    setPreviewContent("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4 custom-scrollbar">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer custom-scrollbar ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <CardContent className="flex flex-col items-center justify-center lg:py-8 py-6 text-center custom-scrollbar">
          <div className="mb-4">
            {dragActive ? (
              <Upload className="h-8 w-8 lg:h-10 lg:w-10 text-primary animate-bounce" />
            ) : (
              <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 custom-scrollbar">
            <p className="text-base lg:text-lg font-medium">{dragActive ? "Drop your file here" : "Upload your project brief"}</p>
            <p className="lg:text-sm text-xs text-muted-foreground">Drag and drop or click to select</p>
            <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT files (max 10MB)</p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
      />

      <Button onClick={onButtonClick} variant="outline" className="w-full" disabled={isGenerating}>
        <File className="h-4 w-4 mr-2" />
        Choose File
      </Button>

      {selectedFile && (
        <Card >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Selected File: {selectedFile.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground max-h-[100px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {previewContent}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFile && fileContent && (
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isGenerating || !fileContent.trim()}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Roadmap
            </>
          )}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
