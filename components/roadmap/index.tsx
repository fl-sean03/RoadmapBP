"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Target, Download, Copy, ChevronDown, Check, ChevronUp } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { RoadmapDisplayProps } from "./types"
import { generatePDF } from "./pdf-generator"
import { generateDOCX } from "./docx-generator"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingState } from "./loading-state"
import { EmptyState } from "./empty-state"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { AnimatePresence, motion } from "framer-motion"

export const RoadmapDisplay = ({ roadmap, isGenerating, steps, currentStep }: RoadmapDisplayProps & { steps?: string[]; currentStep?: number }) => {
  const [openPhases, setOpenPhases] = useState<number[]>([0])
  const [copied, setCopied] = useState(false)
  const [copiedPhase, setCopiedPhase] = useState<number | null>(null)
  const { theme } = useTheme()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const headerRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationDuration = 400; // ms, match framer-motion duration

  const stepsForLoading = steps || [
    'Thinking',
    'Expanding Brief',
    'Generating Phases',
    'Formatting Output',
  ];

  useEffect(() => {
    if (openPhases.length > 0) {
      const lastOpened = openPhases[openPhases.length - 1];
      if (headerRefs.current[lastOpened]) {
        const timeout = setTimeout(() => {
          const header = headerRefs.current[lastOpened];
          if (header) {
            const rect = header.getBoundingClientRect();
            const scrollTop = window.pageYOffset + rect.top - 72; // 72px offset for sticky header
            window.scrollTo({ top: scrollTop, behavior: 'smooth' });
          }
        }, animationDuration);
        return () => clearTimeout(timeout);
      }
    }
  }, [openPhases]);

  const copyToClipboard = async (content: string, phaseIdx?: number) => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      if (typeof phaseIdx === 'number') {
        setCopiedPhase(phaseIdx)
        setTimeout(() => setCopiedPhase(null), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleDownload = async (format: "pdf" | "docx" | "txt", content: string, phaseIdx?: number) => {
    if (!content) return
    if (format === "txt") {
      const element = document.createElement("a")
      const file = new Blob([content], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = phaseIdx !== undefined ? `phase-${phaseIdx + 1}-roadmap.txt` : `project-roadmap.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } else if (format === "pdf") {
      await generatePDF(content)
    } else if (format === "docx") {
      await generateDOCX(content)
    }
  }

  const handlePhaseClick = (idx: number) => {
    setOpenPhases(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx)
      } else {
        return [...prev, idx]
      }
    })
  }

  if (isGenerating) {
    return <LoadingState steps={stepsForLoading} currentStep={typeof currentStep === 'number' ? currentStep : 0} />
  }
  if (!roadmap) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="lg:text-2xl text-xl font-bold">Project Roadmap</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(roadmap.markdowns.join("\n\n---\n\n"))}>
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
              <DropdownMenuItem onClick={() => handleDownload("pdf", roadmap.markdowns.join("\n\n---\n\n"))}>
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("docx", roadmap.markdowns.join("\n\n---\n\n"))}>
                Download as DOCX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("txt", roadmap.markdowns.join("\n\n---\n\n"))}>
                Download as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {roadmap.markdowns.map((md, idx) => {
          const isOpen = openPhases.includes(idx)
          let filteredMd = md;
          if (roadmap.executiveSummaries && roadmap.executiveSummaries[idx]) {
            filteredMd = md.replace(/### Executive Summary[\s\S]*?(?=### )/, "");
          }
          return (
            <Card key={idx} className="w-full" ref={el => { cardRefs.current[idx] = el || null; }}>
              <CardHeader
                ref={el => { headerRefs.current[idx] = el; }}
                onClick={() => handlePhaseClick(idx)}
                className="cursor-pointer flex flex-row items-center justify-between w-full"
              >
                <div>
                  <CardTitle className="lg:text-xl text-lg">Phase {idx + 1}</CardTitle>
                  <CardDescription>{roadmap.phases[idx]?.title}</CardDescription>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); copyToClipboard(md, idx); }}>
                    {copiedPhase === idx ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    <span className="hidden lg:inline">{copiedPhase === idx ? "Copied!" : "Copy"}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                        <Download className="h-4 w-4 mr-1" />
                        <span className="hidden lg:inline">Download</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload("pdf", md, idx)}>
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("docx", md, idx)}>
                        Download as DOCX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("txt", md, idx)}>
                        Download as Text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {isOpen ? <ChevronUp className="h-6 w-6 ml-2" /> : <ChevronDown className="h-6 w-6 ml-2" />}
                </div>
              </CardHeader>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <CardContent>
                      {roadmap.executiveSummaries && roadmap.executiveSummaries[idx] && (
                        <div className="mb-4 lg:p-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-100 shadow-sm">
                          <div className="font-semibold mb-1 text-blue-700 dark:text-blue-200 lg:text-lg text-base">Executive Summary</div>
                          <div className="font-normal text-sm lg:text-base">{roadmap.executiveSummaries[idx]}</div>
                        </div>
                      )}
                      <div className="prose prose-base lg:prose-lg max-w-none dark:prose-invert mb-4 prose-p:my-2 prose-li:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{filteredMd}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 