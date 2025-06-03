"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, Target, Download, Copy, ChevronDown } from "lucide-react"
import { useState, useRef } from "react"
import { RoadmapDisplayProps } from "./types"
import { formatRoadmapContent } from "./content-formatter"
import { generatePDF } from "./pdf-generator"
import { generateDOCX } from "./docx-generator"
import { MilestoneTable, RiskTable } from "./tables"
import { useTheme } from "next-themes"
import { RoadmapCards } from "./roadmap-cards"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const RoadmapDisplay = ({ roadmap, isGenerating }: RoadmapDisplayProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Parse the roadmap string into three separate roadmaps
  const roadmaps = roadmap
    ? [roadmap.roadmap1, roadmap.roadmap2, roadmap.roadmap3]
    : []
  const currentRoadmap = roadmaps[selectedIndex] || ""

  const copyToClipboard = async () => {
    if (!currentRoadmap) return
    try {
      await navigator.clipboard.writeText(currentRoadmap)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const downloadRoadmap = () => {
    if (!currentRoadmap) return
    const element = document.createElement("a")
    const file = new Blob([currentRoadmap], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `project-roadmap-${selectedIndex + 1}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownload = async (format: "pdf" | "docx") => {
    if (!currentRoadmap) return
    setIsDownloading(true)
    try {
      if (format === "pdf") {
        await generatePDF(currentRoadmap)
      } else {
        await generateDOCX(currentRoadmap)
      }
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error)
    } finally {
      setIsDownloading(false)
    }
  }

  const formattedContent = formatRoadmapContent(currentRoadmap)

  if (isGenerating) {
    return (
      <Card className="h-[calc(90vh-8rem)] flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h1 className="lg:text-xl text-lg">Generating Roadmap</h1>
          </CardTitle>
          <CardDescription>AI is analyzing your project and creating comprehensive roadmaps...</CardDescription>
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
            <h1 className="lg:text-xl text-lg">Your Roadmap</h1>
          </CardTitle>
          <CardDescription>Your generated project roadmap will appear here</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium lg:text-base text-sm">Ready to generate your roadmap</p>
              <p className="lg:text-sm text-xs text-muted-foreground">
                Enter your project details or upload a file to get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="lg:text-2xl text-xl font-bold">Project Roadmaps</h2>
      </div>

      <RoadmapCards
        roadmaps={roadmaps}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />

      {currentRoadmap && (
        <Card className="h-[calc(80vh-8rem)] flex flex-col">
          <CardHeader className="flex-none">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Roadmap {selectedIndex + 1}
                </CardTitle>
                <CardDescription>Your comprehensive project roadmap</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={downloadRoadmap}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDownload("pdf")}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          PDF
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDownload("docx")}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          DOCX
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto custom-scrollbar">
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

              <div className={`space-y-2 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>
                {formattedContent.map((item, index) => {
                  if (item.type === "milestone-table" && item.data && item.headers) {
                    return <MilestoneTable key={index} data={item.data} headers={item.headers} />
                  }
                  if (item.type === "risk-table" && item.data && item.headers) {
                    return <RiskTable key={index} data={item.data} headers={item.headers} />
                  }
                  if (item.type === "text" && item.content) {
                    return (
                      <div
                        key={index}
                        className={`${item.className || ""} ${
                          theme === "dark" ? "text-slate-300" : "text-gray-900"
                        }`}
                      >
                        {item.content}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 