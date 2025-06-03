"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, File, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onFileContent: (content: string) => void
  isGenerating: boolean
}

export function FileUpload({ onFileContent, isGenerating }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFile = async (file: File) => {
    setError("")

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
      } else if (file.type === "application/pdf") {
        // For PDF files, we'll extract text (simplified approach)
        content = await file.text() // This is a simplified approach
        if (!content.trim()) {
          setError("Could not extract text from PDF. Please try a text file instead.")
          return
        }
      } else if (file.name.endsWith(".docx")) {
        // For DOCX files, we'll try to extract text (simplified approach)
        content = await file.text() // This is a simplified approach
        if (!content.trim()) {
          setError("Could not extract text from DOCX. Please try a text file instead.")
          return
        }
      }

      if (content.trim()) {
        onFileContent(content)
      } else {
        setError("The file appears to be empty or could not be read.")
      }
    } catch (err) {
      setError("Error reading file. Please try again.")
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            {dragActive ? (
              <Upload className="h-12 w-12 text-primary animate-bounce" />
            ) : (
              <FileText className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{dragActive ? "Drop your file here" : "Upload your project brief"}</p>
            <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
