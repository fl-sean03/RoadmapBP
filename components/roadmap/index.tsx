"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Target, Download, Copy, ChevronDown, Check, ThumbsUp, ThumbsDown, Send } from "lucide-react"
import { useState, useRef } from "react"
import { RoadmapDisplayProps, FormattedContentItem } from "./types"
import { formatRoadmapContent } from "./content-formatter"
import { generatePDF } from "./pdf-generator"
import { generateDOCX } from "./docx-generator"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const RoadmapDisplay = ({ roadmap, isGenerating }: RoadmapDisplayProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPhaseDownloading, setIsPhaseDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [phaseCopied, setPhaseCopied] = useState(false)
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [selectedPhase, setSelectedPhase] = useState<number>(1)

  const formatContent = (phaseContent?: any[]) => {
    if (phaseContent) {
      return phaseContent
        .map(item => {
          if (item.type === "text") return item.content
          if (item.type === "milestone-table" || item.type === "risk-table") {
            return `${item.headers.join(" | ")}\n${item.data.map((row: string[]) => row.join(" | ")).join("\n")}`
          }
          return ""
        })
        .filter(Boolean)
        .join("\n\n")
    }
    return roadmap?.roadmap
  }

  const copyToClipboard = async (phaseContent?: any[]) => {
    const content = formatContent(phaseContent)
    if (!content) return
    
    try {
      await navigator.clipboard.writeText(content)
      if (phaseContent) {
        setPhaseCopied(true)
        setTimeout(() => setPhaseCopied(false), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const downloadRoadmap = (phaseContent?: any[]) => {
    const content = phaseContent 
      ? phaseContent
          .map(item => {
            if (item.type === "text") return item.content
            if (item.type === "milestone-table" || item.type === "risk-table") {
              return `${item.headers.join(" | ")}\n${item.data.map((row: string[]) => row.join(" | ")).join("\n")}`
            }
            return ""
          })
          .filter(Boolean)
          .join("\n\n")
      : roadmap?.roadmap
    
    if (!content) return

    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = phaseContent ? `phase-${selectedPhase}-roadmap.txt` : "project-roadmap.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownload = async (format: "pdf" | "docx", phaseContent?: any[]) => {
    const content = phaseContent 
      ? phaseContent
          .map(item => {
            if (item.type === "text") return item.content
            if (item.type === "milestone-table" || item.type === "risk-table") {
              return `${item.headers.join(" | ")}\n${item.data.map((row: string[]) => row.join(" | ")).join("\n")}`
            }
            return ""
          })
          .filter(Boolean)
          .join("\n\n")
      : roadmap?.roadmap

    if (!content) return
    
    const downloadingState = phaseContent ? setIsPhaseDownloading : setIsDownloading
    downloadingState(true)
    try {
      if (format === "pdf") {
        await generatePDF(content)
      } else {
        await generateDOCX(content)
      }
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error)
    } finally {
      downloadingState(false)
    }
  }

  const formattedContent = formatRoadmapContent(roadmap?.roadmap || "")

  const phases: FormattedContentItem[][] = [];
  let currentPhaseItems: FormattedContentItem[] = [];

  formattedContent.forEach(item => {
    const isExecutiveSummary = item.className?.includes('executive-summary');

    // A phase header always belongs to the block that started with an executive summary.
    // However, the start of a new block is an executive summary.
    if (isExecutiveSummary && currentPhaseItems.some(i => i.className?.includes('phase-header'))) {
        // This condition means we've hit a new executive summary,
        // and the previous phase (which has a header) is complete.
        if (currentPhaseItems.length > 0) {
            phases.push(currentPhaseItems);
            currentPhaseItems = [];
        }
    }
    
    currentPhaseItems.push(item);
  });

  if (currentPhaseItems.length > 0) {
      phases.push(currentPhaseItems);
  }

  // Ensure there are always 3 phases for display
  while (phases.length < 3) {
      phases.push([{
        type: "text",
        content: `Phase ${phases.length + 1}`,
        className: "text-2xl font-bold text-blue-600 mb-6"
      }]);
  }

  const handleFeedback = (isPositive: boolean) => {
    // Here you can add logic to handle the feedback
    console.log(`User gave ${isPositive ? 'positive' : 'negative'} feedback`)
    handleFeedbackSubmit()
  }

  const handleFeedbackSubmit = () => {
    // Here you can add logic to submit the feedback with email
    console.log('Feedback submitted with email:', feedbackEmail)
    setFeedbackSubmitted(true)
    setFeedbackEmail("")
    // Reset after 3 seconds
    setTimeout(() => setFeedbackSubmitted(false), 3000)
  }

  if (isGenerating) {
    return (
      <Card className="h-[calc(90vh-8rem)] flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h1 className="lg:text-xl text-lg">Generating Roadmap</h1>
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
        <h2 className="lg:text-2xl text-xl font-bold">Project Roadmap</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard()}>
            {copied ? <Check className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" /> : <Copy className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />}
            <span className="hidden lg:block">{copied ? "Copied!" : "Copy Full Roadmap"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />
                <span className="hidden lg:block">Download Full Roadmap</span>
                <ChevronDown className="lg:h-4 lg:w-4 h-3 w-3 lg:ml-2 ml-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadRoadmap()}>
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
              <DropdownMenuItem onClick={() => handleDownload("pdf")} disabled={isDownloading}>
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
              <DropdownMenuItem onClick={() => handleDownload("docx")} disabled={isDownloading}>
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

      {/* Phase Selection Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:gap-4 gap-2">
        {[1, 2, 3].map((phase) => (
          <Card
            key={phase}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPhase === phase ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedPhase(phase)}
          >
            <CardHeader className="flex lg:flex-row flex-col items-center gap-0.5">
              <div className="lg:p-2 p-1 rounded-lg bg-primary/10">
                <Target className="lg:h-5 lg:w-5 h-4 w-4" />
              </div>
              <div>
                <CardTitle className="lg:text-lg text-base">Phase {phase}</CardTitle>
                <CardDescription className="hidden lg:block">Click to view this phase</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Phase Content */}
      <Card className="h-[calc(80vh-8rem)] flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 lg:text-xl text-lg">
                <Target className="lg:h-5 lg:w-5 h-4 w-4" />
                Phase {selectedPhase}
              </CardTitle>
              <CardDescription>Project phase details and milestones</CardDescription>
            </div>
            {phases[selectedPhase - 1] && phases[selectedPhase - 1].length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(phases[selectedPhase - 1])}
                >
                  {phaseCopied ? <Check className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" /> : <Copy className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />}
                  <span className="hidden lg:block">{phaseCopied ? "Copied!" : "Copy Phase"}</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />
                      <span className="hidden lg:block">Download Phase {selectedPhase}</span>
                      <ChevronDown className="lg:h-4 lg:w-4 h-3 w-3 lg:ml-2 ml-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => downloadRoadmap(phases[selectedPhase - 1])}>
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
                      onClick={() => handleDownload("pdf", phases[selectedPhase - 1])} 
                      disabled={isPhaseDownloading}
                    >
                      {isPhaseDownloading ? (
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
                      onClick={() => handleDownload("docx", phases[selectedPhase - 1])} 
                      disabled={isPhaseDownloading}
                    >
                      {isPhaseDownloading ? (
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
            )}
          </div>
          
          <Separator />
        </CardHeader>
        <CardContent className="flex-1 overflow-auto custom-scrollbar" ref={contentRef}>
          {phases[selectedPhase - 1] && phases[selectedPhase - 1].length > 0 ? (
            <div className={`space-y-2 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>
              {phases[selectedPhase - 1].map((item: any, index: number) => {
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
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No content available for this phase
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            

            <p className="text-sm text-muted-foreground">Was this roadmap helpful?</p>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(true)}
                className={`transition-all hover:text-green-600 hover:border-green-600`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Yes
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(false)}
                className={`transition-all hover:text-red-600 hover:border-red-600`}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                No
              </Button>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFeedbackSubmit}
                  className="transition-all hover:text-blue-600 hover:border-blue-600"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>

            {feedbackSubmitted && (
              <p className="text-sm text-green-600 animate-fade-in">
                Thank you for your feedback!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 