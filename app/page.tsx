"use client"

import { useState, useEffect } from "react"
import { generateFullRoadmap } from "./actions"
import { RoadmapDisplay } from "@/components/roadmap-display"
import { InputSection } from "@/components/input-section"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import React from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"

export default function Home() {
  const [projectBrief, setProjectBrief] = useState("")
  const [roadmap, setRoadmap] = useState<{
    expandedBrief: string
    phases: any[]
    markdowns: string[]
    executiveSummaries: string[]
    id?: string
  } | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dbSaveStatus, setDbSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  // Dynamic steps for loading state
  const [steps, setSteps] = useState<string[]>(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]);
  const [currentStep, setCurrentStep] = useState(0); // 0-based index

  // Show toast notification when database save status changes
  useEffect(() => {
    if (dbSaveStatus === 'success') {
      toast({
        title: "Saved to database",
        description: "Your roadmap has been saved for future reference",
        variant: "default",
      })
    } else if (dbSaveStatus === 'error') {
      toast({
        title: "Database error",
        description: "Could not save your roadmap to the database. Check console for details.",
        variant: "destructive",
      })
    }
  }, [dbSaveStatus, toast])

  const handleTextSubmit = async () => {
    if (!projectBrief.trim()) return

    setIsGenerating(true)
    setCurrentStep(0)
    setDbSaveStatus('idle')
    setSteps(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]); // Static steps
    
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await import("./actions").then(m => m.expandBrief(projectBrief))
      
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await import("./actions").then(m => m.generatePhases(expandedBrief))
      
      // Step 4: Formatting Output (generating markdowns for all phases)
      setCurrentStep(3)
      const markdowns: string[] = []
      const executiveSummaries: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown, executiveSummary } = await import("./actions").then(m => m.generatePhaseMarkdown(phases[idx], expandedBrief))
        markdowns.push(markdown)
        executiveSummaries.push(executiveSummary)
      }
      
      // Save to Database (no loading step)
      const saveData = {
        userInput: projectBrief,
        expandedBrief,
        phases,
        markdowns,
        executiveSummaries,
      }
      const savedRoadmap = await import("./lib/db-helpers").then(m => m.saveRoadmap(saveData))
      setRoadmap({ expandedBrief, phases, markdowns, executiveSummaries, id: savedRoadmap?.id })
      setDbSaveStatus(savedRoadmap?.id ? 'success' : 'error')
    } catch (error) {
      console.error("Error generating roadmap:", error)
      setDbSaveStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileContent = async (content: string) => {
    setIsGenerating(true)
    setCurrentStep(0)
    setDbSaveStatus('idle')
    setSteps(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]); // Static steps
    
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await import("./actions").then(m => m.expandBrief(content))
      
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await import("./actions").then(m => m.generatePhases(expandedBrief))
      
      // Step 4: Formatting Output (generating markdowns for all phases)
      setCurrentStep(3)
      const markdowns: string[] = []
      const executiveSummaries: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown, executiveSummary } = await import("./actions").then(m => m.generatePhaseMarkdown(phases[idx], expandedBrief))
        markdowns.push(markdown)
        executiveSummaries.push(executiveSummary)
      }
      
      // Save to Database (no loading step)
      const saveData = {
        userInput: content,
        expandedBrief,
        phases,
        markdowns,
        executiveSummaries,
      }
      const savedRoadmap = await import("./lib/db-helpers").then(m => m.saveRoadmap(saveData))
      setRoadmap({ expandedBrief, phases, markdowns, executiveSummaries, id: savedRoadmap?.id })
      setDbSaveStatus(savedRoadmap?.id ? 'success' : 'error')
    } catch (error) {
      console.error("Error generating roadmap:", error)
      setDbSaveStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 lg:px-0 px-3">
      <Navbar />

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
