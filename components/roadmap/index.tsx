"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, Target, Download, Copy, FileDown } from "lucide-react"
import { useState, useRef } from "react"
import { RoadmapDisplayProps } from "./types"
import { formatRoadmapContent } from "./content-formatter"
import { generatePDF } from "./pdf-generator"

export function RoadmapDisplay({ roadmap, isGenerating }: RoadmapDisplayProps) {
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roadmap)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const downloadRoadmap = () => {
    const element = document.createElement("a")
    const file = new Blob([roadmap], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "project-roadmap.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadPDF = async () => {
    await generatePDF(roadmap)
  }

  if (isGenerating) {
    return (
      <Card className="h-[calc(90vh-8rem)] flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Generating Roadmap
          </CardTitle>
          <CardDescription>AI is analyzing your project and creating a comprehensive roadmap...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!roadmap) {
    return (
      <Card className="h-[calc(90vh-8rem)] flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Roadmap
          </CardTitle>
          <CardDescription>Your generated project roadmap will appear here</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">Ready to generate your roadmap</p>
              <p className="text-sm text-muted-foreground">
                Enter your project details or upload a file to get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[calc(90vh-8rem)] flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generated Roadmap
            </CardTitle>
            <CardDescription>Your comprehensive project roadmap</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadRoadmap} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              TXT
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4" ref={contentRef}>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Timeline Included
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Resource Planning
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Milestone Tracking
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">{formatRoadmapContent(roadmap)}</div>
        </div>
      </CardContent>
    </Card>
  )
} 