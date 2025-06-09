"use client"

import { useState } from "react"
import { generateFullRoadmap, expandBrief, generatePhases, generatePhaseMarkdown } from "./actions"
import { RoadmapDisplay } from "@/components/roadmap-display"
import { InputSection } from "@/components/input-section"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React from "react"
import Image from "next/image"

export default function Home() {
  const [projectBrief, setProjectBrief] = useState("")
  const [roadmap, setRoadmap] = useState<{
    expandedBrief: string
    phases: any[]
    markdowns: string[]
  } | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Step progress for loading state
  const steps = [
    'Thinking',
    'Expanding Brief',
    'Generating Phases',
    'Formatting Output'
  ];
  const [currentStep, setCurrentStep] = useState(0); // 0-based index

  // Ensure component is mounted before showing theme toggle
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleTextSubmit = async () => {
    if (!projectBrief.trim()) return

    setIsGenerating(true)
    setCurrentStep(0)
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await expandBrief(projectBrief)
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await generatePhases(expandedBrief)
      // Step 4: Formatting Output (generate markdowns)
      setCurrentStep(3)
      const markdowns: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown } = await generatePhaseMarkdown(phases[idx], expandedBrief)
        markdowns.push(markdown)
      }
      setRoadmap({ expandedBrief, phases, markdowns })
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileContent = async (content: string) => {
    setIsGenerating(true)
    setCurrentStep(0)
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await expandBrief(content)
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await generatePhases(expandedBrief)
      // Step 4: Formatting Output (generate markdowns)
      setCurrentStep(3)
      const markdowns: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown } = await generatePhaseMarkdown(phases[idx], expandedBrief)
        markdowns.push(markdown)
      }
      setRoadmap({ expandedBrief, phases, markdowns })
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 lg:px-0 px-3">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="lg:max-w-[85vw] max-w-[95vw] mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="Lovable Logo" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div> */}
            <span className="font-semibold text-xl">RoadmapBP</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:max-w-[85vw] max-w-[95vw] mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="lg:text-4xl text-2xl font-bold mb-2">Generate a roadmap for your project</h1>
          <p className="text-muted-foreground">Create a roadmap for your project with AI</p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto">
          <InputSection
            projectBrief={projectBrief}
            setProjectBrief={setProjectBrief}
            isGenerating={isGenerating}
            onTextSubmit={handleTextSubmit}
            onFileContent={handleFileContent}
          />
        </div>

        {/* Output Section */}
        {(roadmap || isGenerating) && (
          <div className="mt-8 max-w-4xl mx-auto">
            <RoadmapDisplay roadmap={roadmap} isGenerating={isGenerating} steps={steps} currentStep={currentStep} />
          </div>
        )}
      </main>
    </div>
  )
}
