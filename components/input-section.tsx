"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus, X, Paperclip } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { useState } from "react"

interface InputSectionProps {
  projectBrief: string
  setProjectBrief: (value: string) => void
  isGenerating: boolean
  onTextSubmit: () => void
  onFileContent: (content: string) => void
}

export const InputSection = ({
  projectBrief,
  setProjectBrief,
  isGenerating,
  onTextSubmit,
  onFileContent,
}: InputSectionProps) => {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [filePreview, setFilePreview] = useState<{
    name: string;
    content: string;
  } | null>(null)

  const handleFileContent = (content: string, fileName: string) => {
    setFilePreview({ name: fileName, content })
    setShowFileUpload(false)
  }

  const removeFile = () => {
    setFilePreview(null)
  }

  const handleSubmit = () => {
    if (!projectBrief.trim() && !filePreview) return;
    
    if (filePreview) {
      // Combine file content with any additional context if provided
      const combinedContent = projectBrief.trim() 
        ? `${projectBrief}\n\nAttached File (${filePreview.name}):\n${filePreview.content}`
        : filePreview.content;
      onFileContent(combinedContent);
    } else {
      onTextSubmit();
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border ring-1 ring-slate-300 dark:ring-slate-500 focus-within:ring-1 focus-within:ring-slate-500 focus-within:border-slate-500 dark:focus-within:ring-slate-400 dark:focus-within:border-slate-400 transition-all duration-500">
      <div className="p-4">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Attached: {filePreview.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-3">
              {filePreview.content.slice(0, 200)}...
            </div>
          </div>
        )}

        {/* Input Field - Always shows the same placeholder */}
        <Textarea
          placeholder="Ask RoadmapBP to create a roadmap for my..."
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          className="min-h-[100px] bg-transparent dark:bg-transparent resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 lg:text-lg text-base px-0 py-2"
        />
        
        <div className="flex justify-between items-center lg:mt-4 mt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="rounded-full"
          >
            <Paperclip className="h-5 w-5 lg:w-6 lg:h-6" />
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={(!projectBrief.trim() && !filePreview) || isGenerating}
            className="rounded-full lg:px-8 px-6"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full lg:h-5 lg:w-5 h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="lg:h-5 lg:w-5 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {showFileUpload && (
        <div className="border-t p-4">
          <FileUpload onFileContent={handleFileContent} isGenerating={isGenerating} />
        </div>
      )}
    </div>
  )
} 